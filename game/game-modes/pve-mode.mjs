import { AIFactory, TraditionalAI, runGameSimulation, UserInputAI } from '../../ai/index.mjs'
import { GameConfig } from '../../config.mjs'
import { NeuralNetwork } from '../../neural/neural-network.mjs'

import { BaseMode } from './base-mode.mjs'

export class PVEMode extends BaseMode {
	async initialize(gameManager, options) {
		this.gameManager = gameManager
		this.playerAIs = { X: null, O: null }
		this.playerSide = 'X'
		await super.initialize(gameManager, options)

		this.gameManager.uiManager.hideAllControls()
		this.gameManager.uiManager.showView('game-view')
		const userInputAI = AIFactory.createUserInputAI(this.gameManager)
		const opponentAI = await this.createOpponentAI()

		this.playerAIs.X = this.playerSide === 'X' ? userInputAI : opponentAI
		this.playerAIs.O = this.playerSide === 'O' ? userInputAI : opponentAI

		this.gameManager.uiManager.displayVisualizationForPlayer('X', this.playerAIs.X.getVisualizationUI())
		this.gameManager.uiManager.displayVisualizationForPlayer('O', this.playerAIs.O.getVisualizationUI())
		this.gameManager.uiManager.showPveControls()
	}

	async handleUrlParams(options) {
		this.playerSide = options.playerSide || 'X'

		if (options.aiUrl) {
			const network = await NeuralNetwork.fromUrl(options.aiUrl)
			if (network)
				this.playerAIs[this.playerSide === 'X' ? 'O' : 'X'] = AIFactory.createNeuralAI(network)
		}
	}

	async createOpponentAI() {
		const opponentSide = this.playerSide === 'X' ? 'O' : 'X'
		if (this.playerAIs[opponentSide])
			return this.playerAIs[opponentSide]

		const gaInstance = this.gameManager.gaInstance
			const population = gaInstance.population
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
		}
		return AIFactory.createTraditionalAI()
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
