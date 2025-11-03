import { GameConfig } from '../config.mjs'
import { GeneticAlgorithm } from '../neural/genetic-algorithm.mjs'
import { TrainingManager } from '../neural/training-manager.mjs'
import { UIManager } from '../ui/ui-manager.mjs'

import { GameModeManager } from './game-modes/index.mjs'
import { GameState } from './game-state.mjs'

export class GameManager {
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

	async initialize() {
		const { ga, evolutionData } = await GeneticAlgorithm.createWithEvolutionData(GameConfig.ai.populationSize, GameConfig.ai.mutationRate)
		this.geneticAlgorithm = ga
		this.trainingManager = new TrainingManager(this.geneticAlgorithm, evolutionData)
	}

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

	restartCurrentGame() {
		if (this.currentModeName) this.startGame(this.currentModeName, this.currentModeOptions)
	}

	async resetToModeSelection() {
		await this.modeManager.currentMode?.cleanup?.()

		this.uiManager.showView('mode-selection')
		this.uiManager.hideEndgameActions()
		this.uiManager.resetBoardAndWinningLine()
	}

	handleCellClick(cellIndex) {
		if (!this.gameState.gameActive) return

		// 如果有正在等待的输入，则解析 Promise
		if (this.userInputResolver) {
			this.userInputResolver(cellIndex)
			this.userInputResolver = null // 重置
		}
	}

	/**
	 * 等待玩家输入的公共接口
	 * @returns {Promise<number>} 一个解析为玩家点击的 cellIndex 的 Promise
	 */
	waitForPlayerInput() {
		this.uiManager.setBoardInteraction(true)
		return new Promise(resolve => {
			this.userInputResolver = resolve
		}).finally(() => {
			this.uiManager.setBoardInteraction(false)
		})
	}

	handleGameEnd() {
		this.uiManager.showEndgameActions()
		this.uiManager.showExportHistoryButton()
		this.lastGameHistory = [...this.gameState.moveHistory]
		// 调用AI回调
		this.callAIEndGameCallbacks()
	}

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

	async handleAIMove(ai, gameState) {
		const move = await ai.getMove(gameState)

		// Add a small delay to show the activation
		await new Promise(resolve => setTimeout(resolve, GameConfig.animation.moveDuration))

		await this.makeMove(move)
	}

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

	stopReplay() {
		this.isReplayCancelled = true
	}

	exitGame() {
		this.resetToModeSelection()
	}
	callAIEndGameCallbacks() {
		const winner = GameState.checkWinConditionFromState(this.gameState.board)?.winner

		this.modeManager.currentMode?.playerAIs?.[winner]?.onWin?.()
		this.modeManager.currentMode?.playerAIs?.[winner === 'X' ? 'O' : 'X']?.onLose?.()
		if (!winner) Object.values(this.modeManager.currentMode?.playerAIs).forEach(ai => ai.onDraw?.())
	}
}
