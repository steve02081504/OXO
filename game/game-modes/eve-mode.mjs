import { AIFactory } from '../../ai/index.mjs'
import { NeuralNetwork } from '../../neural/neural-network.mjs'

import { BaseMode } from './base-mode.mjs'

export class EVEMode extends BaseMode {
	async initialize(gameManager, options = {}) {
		this.playerAIs = { X: null, O: null }
		await super.initialize(gameManager, options)

		const { networkX, networkO } = this.determineNetworks(options)
		if (!this.playerAIs.X)
			this.playerAIs.X = AIFactory.createNeuralAI(networkX)
		if (!this.playerAIs.O)
			this.playerAIs.O = AIFactory.createNeuralAI(networkO)

		this.gameManager.uiManager.hideAllControls()
		this.gameManager.uiManager.showView('game-view')
		this.gameManager.uiManager.displayVisualizationForPlayer('X', this.playerAIs.X.visualizer.createCanvasWithWrapper())
		this.gameManager.uiManager.displayVisualizationForPlayer('O', this.playerAIs.O.visualizer.createCanvasWithWrapper())
		this.gameManager.uiManager.showControlsForMode('eve')
		this.startAutoplay()
	}

	determineNetworks(options) {
		let { networkX, networkO } = options
		const ga = this.gameManager.gaInstance

		if (ga && ga.population.length > 1) {
			if (!networkX)
				networkX = ga.population[Math.floor(Math.random() * ga.population.length)]

			if (!networkO) {
				let randIndex
				do
					randIndex = Math.floor(Math.random() * ga.population.length)
				while (ga.population[randIndex] === networkX)
				networkO = ga.population[randIndex]
			}
		} else {
			networkX = new NeuralNetwork()
			networkO = new NeuralNetwork()
		}
		return { networkX, networkO }
	}

	async handleUrlParams(options) {
		const loadAndSetAI = async (player, url) => {
			if (url) {
				const network = await NeuralNetwork.fromUrl(url)
				if (network) this.playerAIs[player] = AIFactory.createNeuralAI(network)
			}
		}

		await Promise.all([
			loadAndSetAI('X', options.XAIUrl),
			loadAndSetAI('O', options.OAIUrl)
		])
	}

	cleanup() {
		super.cleanup()
		this.gameManager.uiManager.hideAllControls()
		this.gameManager.uiManager.clearAllVisualizations()
	}

	startAutoplay() {
		const gameLoop = async () => {
			if (!this.gameManager.gameState.gameActive || this.gameManager.modeManager.currentMode !== this)
				return

			const state = this.gameManager.gameState
			const ai = this.playerAIs[state.currentPlayer]
			await this.gameManager.handleAIMove(ai, state)

			setTimeout(gameLoop, 500)
		}

		gameLoop()
	}
}
