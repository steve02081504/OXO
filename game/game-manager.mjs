import { GameConfig } from '../config.mjs'
import { GeneticAlgorithm } from '../neural/genetic-algorithm.mjs'
import { TrainingManager } from '../neural/training-manager.mjs'
import { UIManager } from '../ui/ui-manager.mjs'

import { GameModeManager } from './game-modes/index.mjs'
import { GameState } from './game-state.mjs'

/**
 * @class GameManager
 * @classdesc 游戏管理器，负责整个游戏的逻辑。
 */
export class GameManager {
	/**
	 * @constructor
	 */
	constructor() {
		this.gameState = new GameState()
		this.uiManager = new UIManager(this)
		this.modeManager = new GameModeManager(this)
		this.lastGameHistory = []
		this.geneticAlgorithm = null
		this.trainingManager = null
		this.isReplayCancelled = false
		this.currentModeName = null
		this.currentModeOptions = {}
		this.userInputResolver = null
	}

	/**
	 * 初始化游戏管理器。
	 */
	async initialize() {
		const { ga, evolutionData } = await GeneticAlgorithm.createWithEvolutionData(GameConfig.ai.populationSize, GameConfig.ai.mutationRate)
		this.geneticAlgorithm = ga
		this.trainingManager = new TrainingManager(this.geneticAlgorithm, evolutionData)
	}

	/**
	 * 开始一个新游戏。
	 * @param {string} mode - 游戏模式。
	 * @param {object} [options={}] - 游戏选项。
	 */
	async startGame(mode, options = {}) {
		this.currentModeName = mode
		this.currentModeOptions = options
		this.gameState.reset()
		this.uiManager.reset()
		await this.modeManager.switchToMode(mode, options)
		this.uiManager.updateBoard(this.gameState.board, this.gameState.moveHistory)
		this.uiManager.updateTurnIndicator(this.gameState.currentPlayer)
		await this.modeManager.currentMode.onMoveMade()
	}

	/**
	 * 重新开始当前游戏。
	 */
	restartCurrentGame() {
		if (this.currentModeName) this.startGame(this.currentModeName, this.currentModeOptions)
	}

	/**
	 * 重置到模式选择界面。
	 */
	async resetToModeSelection() {
		await this.modeManager.currentMode?.cleanup?.()

		this.uiManager.showView('mode-selection')
		this.uiManager.hideEndgameActions()
		this.uiManager.resetBoardAndWinningLine()
	}

	/**
	 * 处理单元格点击事件。
	 * @param {number} cellIndex - 被点击的单元格索引。
	 */
	handleCellClick(cellIndex) {
		if (!this.gameState.gameActive) return

		// 如果有正在等待的输入，则解析 Promise
		if (this.userInputResolver) {
			this.userInputResolver(cellIndex)
			this.userInputResolver = null // 重置
		}
	}

	/**
	 * 等待玩家输入的公共接口。
	 * @returns {Promise<number>} 一个解析为玩家点击的 cellIndex 的 Promise。
	 */
	waitForPlayerInput() {
		this.uiManager.setBoardInteraction(true)
		return new Promise(resolve => {
			this.userInputResolver = resolve
		}).finally(() => {
			this.uiManager.setBoardInteraction(false)
		})
	}

	/**
	 * 处理游戏结束。
	 */
	handleGameEnd() {
		this.uiManager.showEndgameActions()
		this.uiManager.showExportHistoryButton()
		this.lastGameHistory = [...this.gameState.moveHistory]
		// 调用AI回调
		this.callAIEndGameCallbacks()
	}

	/**
	 * 执行一步移动。
	 * @param {number} cellIndex - 移动的单元格索引。
	 */
	async makeMove(cellIndex) {
		if (!this.gameState.gameActive) return

		const moveResult = this.gameState.makeMove(cellIndex)

		if (moveResult.type === 'invalid') {
			console.error('Invalid move')
			await this.modeManager.currentMode.onMoveMade()
			return
		}

		this.uiManager.updateBoard(this.gameState.board, this.gameState.moveHistory)
		this.uiManager.updateTurnIndicator(this.gameState.currentPlayer)

		if (moveResult.type === 'win') {
			await this.uiManager.drawWinningLine(moveResult.result)
			this.handleGameEnd()
			return
		}

		if (moveResult.type === 'draw') {
			this.handleGameEnd()
			return
		}

		await this.modeManager.currentMode.onMoveMade()
	}

	/**
	 * 处理AI的移动。
	 * @param {object} ai - AI实例。
	 * @param {object} gameState - 游戏状态。
	 */
	async handleAIMove(ai, gameState) {
		const move = await ai.getMove(gameState)

		// Add a small delay to show the activation
		await new Promise(resolve => setTimeout(resolve, GameConfig.animation.moveDuration))

		await this.makeMove(move)
	}

	/**
	 * 播放游戏历史记录。
	 * @param {Array<object>} fullMoveHistory - 完整的移动历史记录。
	 * @param {number} [delay=GameConfig.animation.moveDuration] - 每一步之间的延迟。
	 * @param {Function|null} [onStep=null] - 每一步的回调函数。
	 */
	async playHistory(fullMoveHistory, delay = GameConfig.animation.moveDuration, onStep = null) {
		this.isReplayCancelled = false
		this.uiManager.resetBoardAndWinningLine()
		const replayState = new GameState()

		for (let i = 0; i < fullMoveHistory.length; i++) {
			if (this.isReplayCancelled) {
				console.log('Replay interrupted.')
				break
			}
			const move = fullMoveHistory[i]

			this.uiManager.updateTurnIndicator(move.player)

			replayState.currentPlayer = move.player
			replayState.makeMove(move.cellIndex)

			this.uiManager.updateBoard(
				replayState.board,
				replayState.moveHistory
			)

			if (onStep) onStep(i + 1, fullMoveHistory.length)

			await new Promise(resolve => setTimeout(resolve, delay))
		}

		const finalWinResult = GameState.checkWinConditionFromState(replayState.board)
		if (!finalWinResult && !replayState.isBoardFull())
			this.uiManager.updateTurnIndicator(replayState.currentPlayer)
		else this.uiManager.updateTurnIndicator('')

		const winResult = GameState.checkWinConditionFromState(replayState.board)
		if (winResult)
			await this.uiManager.drawWinningLine(winResult)
	}

	/**
	 * 停止回放。
	 */
	stopReplay() {
		this.isReplayCancelled = true
	}

	/**
	 * 退出游戏。
	 */
	exitGame() {
		this.resetToModeSelection()
	}

	/**
	 * 调用AI的游戏结束回调。
	 */
	callAIEndGameCallbacks() {
		const winner = GameState.checkWinConditionFromState(this.gameState.board)?.winner

		this.modeManager.currentMode?.playerAIs?.[winner]?.onWin?.()
		this.modeManager.currentMode?.playerAIs?.[winner === 'X' ? 'O' : 'X']?.onLose?.()
		if (!winner) Object.values(this.modeManager.currentMode?.playerAIs).forEach(ai => ai.onDraw?.())
	}
}
