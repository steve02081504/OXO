import { AIFactory, TraditionalAI, runGameSimulation, PlayerInputAdapter } from '../../ai/index.mjs'
import { GameConfig } from '../../config.mjs'
import { NeuralNetwork } from '../../neural/neural-network.mjs'

import { BaseMode } from './base-mode.mjs'

/**
 * @class PVEMode
 * @classdesc PVE模式，玩家对抗AI。
 * @augments BaseMode
 */
export class PVEMode extends BaseMode {
	/**
	 * 初始化PVEMode。
	 * @param {object} gameManager - 游戏管理器实例。
	 * @param {object} options - 初始化选项。
	 */
	async initialize(gameManager, options) {
		this.playerAIs = { X: null, O: null }
		this.playerSide = 'X'
		await super.initialize(gameManager, options)

		this.gameManager.uiManager.hideAllControls()
		this.gameManager.uiManager.showView('game-view')
		const userInputAI = AIFactory.createPlayerInputAdapter(this.gameManager)
		const opponentAI = await this.createOpponentAI()

		this.playerAIs.X = this.playerSide === 'X' ? userInputAI : opponentAI
		this.playerAIs.O = this.playerSide === 'O' ? userInputAI : opponentAI

		this.gameManager.uiManager.displayVisualizationForPlayer('X', this.playerAIs.X.getVisualizationUI())
		this.gameManager.uiManager.displayVisualizationForPlayer('O', this.playerAIs.O.getVisualizationUI())
		this.gameManager.uiManager.showPveControls()
	}

	/**
	 * 处理URL参数。
	 * @param {object} options - URL参数。
	 */
	async handleUrlParams(options) {
		this.playerSide = options.playAs || 'X'

		if (options.opponentNetworkUrl) try {
			this.playerAIs[this.playerSide === 'X' ? 'O' : 'X'] = AIFactory.createNeuralAI(await NeuralNetwork.fromUrl(options.opponentNetworkUrl))
		} catch (error) {
			alert(`Failed to load opponent network from ${options.opponentNetworkUrl}:\n${error.message}`)
		}
	}

	/**
	 * 创建对手AI。
	 * @returns {object} 对手AI实例。
	 */
	async createOpponentAI() {
		const opponentSide = this.playerSide === 'X' ? 'O' : 'X'
		if (this.playerAIs[opponentSide])
			return this.playerAIs[opponentSide]

		const { geneticAlgorithm } = this.gameManager
		const { population } = geneticAlgorithm
		if (population.length > 0) {
			const traditionalAI = new TraditionalAI()
			const challengerNetwork = population.reduce((prev, current) => prev.fitness > current.fitness ? prev : current)
			if (challengerNetwork) {
				const challengerAI = AIFactory.createNeuralAI(challengerNetwork)
				const { winner } = await runGameSimulation(challengerAI, traditionalAI, GameConfig.ai.training.silentBattleMaxMoves)
				if (winner === 'X') {
					console.log('PVE AI is a Neural Network champion!')
					return challengerAI
				} else {
					console.log('PVE AI is the Traditional AI.')
					return traditionalAI
				}
			}
		}
		return AIFactory.createTraditionalAI()
	}

	/**
	 * 清理模式状态。
	 */
	async cleanup() {
		super.cleanup()
		this.gameManager.uiManager.clearAllVisualizations()
	}

	/**
	 * 处理移动事件。
	 */
	async onMoveMade() {
		const { gameState } = this.gameManager
		if (!gameState.gameActive) return

		const currentPlayerAI = this.playerAIs[gameState.currentPlayer]
		const isUserInput = currentPlayerAI instanceof PlayerInputAdapter

		if (!isUserInput) {
			this.gameManager.uiManager.indicateThinking(true, gameState.currentPlayer)
			await new Promise(resolve => setTimeout(resolve, 500))
			this.gameManager.uiManager.indicateThinking(false, gameState.currentPlayer)
		}

		await this.gameManager.handleAIMove(currentPlayerAI, gameState)
	}

}
