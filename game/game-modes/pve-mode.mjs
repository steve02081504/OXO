import { AIFactory, TraditionalAI, runGameSimulation, UserInputAI } from '../../ai/index.mjs'
import { GameConfig } from '../../config.mjs'

import { BaseMode } from './base-mode.mjs'

export class PVEMode extends BaseMode {
	async initialize(gameManager, options) {
		await super.initialize(gameManager, options)
		this.gameManager.uiManager.hideAllControls()
		this.gameManager.uiManager.showView('game-view')

		this.playerSide = options.playerSide || 'X'
		this.playerAIs = { X: null, O: null }

		const userInputAI = AIFactory.createUserInputAI(gameManager)

		let opponentAI
		const gaInstance = this.gameManager.gaInstance
		const population = gaInstance.population
		if (population.length > 0) {
			const traditionalAI = new TraditionalAI()
			const challengerNetwork = population.reduce((prev, current) => prev.fitness > current.fitness ? prev : current)

			if (challengerNetwork) {
				const challengerAI = AIFactory.createNeuralAI(challengerNetwork)
				// 挑战者(X) vs 传统AI(O)
				const { winner } = await runGameSimulation(challengerAI, traditionalAI, GameConfig.ai.training.silentBattleMaxMoves)

				if (winner === 'X') {
					opponentAI = challengerAI // 直接复用创建的实例
					console.log('PVE AI is a Neural Network champion!')
				} else {
					opponentAI = traditionalAI
					console.log('PVE AI is the Traditional AI.')
				}
			} else opponentAI = AIFactory.createTraditionalAI()
		} else opponentAI = AIFactory.createTraditionalAI()

		this.playerAIs.X = this.playerSide === 'X' ? userInputAI : opponentAI
		this.playerAIs.O = this.playerSide === 'O' ? userInputAI : opponentAI

		this.gameManager.uiManager.displayVisualizationForPlayer('X', this.playerAIs.X.getVisualizationUI())
		this.gameManager.uiManager.displayVisualizationForPlayer('O', this.playerAIs.O.getVisualizationUI())
		this.gameManager.uiManager.showPveControls()
	}

	async cleanup() {
		super.cleanup()
		this.gameManager.uiManager.clearAllVisualizations()
	}

	async onMoveMade() {
		const gameState = this.gameManager.gameState
		if (!gameState.gameActive) return

		const currentPlayerAI = this.playerAIs[gameState.currentPlayer]
		const isUserInput = currentPlayerAI instanceof UserInputAI

		if (!isUserInput) {
			this.gameManager.uiManager.indicateThinking(true, gameState.currentPlayer)
			await new Promise(resolve => setTimeout(resolve, 500))
			this.gameManager.uiManager.indicateThinking(false, gameState.currentPlayer)
		}

		await this.gameManager.handleAIMove(currentPlayerAI, gameState)
	}

}
