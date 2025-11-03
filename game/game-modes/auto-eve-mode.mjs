import { NeuralNetwork } from '../../neural/neural-network.mjs'
import { confirmResetButton, confirmResetModal } from '../../ui/DOM.mjs'
import { NeuralNetworkVisualizer } from '../../ui/neural-network-visualizer.mjs'

import { BaseMode } from './base-mode.mjs'

export class AutoEVEMode extends BaseMode {
	async initialize(gameManager, options) {
		await super.initialize(gameManager, options)

		this.gameManager.uiManager.hideAllControls()
		this.gameManager.uiManager.showView('game-view')
		this.gameManager.uiManager.showAutoEveControls()

		this.visualizerX = new NeuralNetworkVisualizer()
		this.visualizerO = new NeuralNetworkVisualizer()

		const uiX = this.visualizerX.createCanvasWithWrapper()
		const uiO = this.visualizerO.createCanvasWithWrapper()

		this.gameManager.uiManager.displayVisualizationForPlayer('X', uiX)
		this.gameManager.uiManager.displayVisualizationForPlayer('O', uiO)

		this.restartTrainingHandler = this.handleRestartTraining.bind(this)
		confirmResetButton.addEventListener('click', this.restartTrainingHandler)

		this.gameManager.trainingManager.setFullSpeed(true)
		console.log('Switched to full-speed training for Auto-EVE mode.')

		this.autoEveAnimationPlaying = true
		this.autoEveCurrentGame = null
		this.autoEveGameStep = 0

		this.isAnimationPlaying = false

		this.updateAutoEveStats()
		this.runUiLoop()
	}

	async handleUrlParams(options) {
		const urls = [].concat(options.importNetworkUrl || [])
		for (const url of urls) try {
			this.gameManager.geneticAlgorithm.population.push(await NeuralNetwork.fromUrl(url))
		} catch (error) {
			alert(`Failed to import network from ${url}:\n${error.message}`)
		}
	}

	async handleRestartTraining() {
		confirmResetModal.close()
		this.gameManager.trainingManager.resetTraining()
		this.gameManager.uiManager.reset()
		this.autoEveCurrentGame = null
		this.autoEveGameStep = 0
		this.isAnimationPlaying = false
		this.updateAutoEveStats()
		console.log('Auto-EVE training reset and restarted.')
	}

	async cleanup() {
		await super.cleanup()

		this.gameManager.trainingManager.setFullSpeed(false)
		console.log('Switched to background training for Auto-EVE mode.')

		this.gameManager.stopReplay()

		confirmResetButton.removeEventListener('click', this.restartTrainingHandler)

		// 进化数据已经在 TrainingManager 中保存，无需额外保存

		this.gameManager.uiManager.hideAutoEveControls()
		this.gameManager.uiManager.clearAllVisualizations()
		this.gameManager.uiManager.reset()
	}

	async runUiLoop() {
		while (this.gameManager.modeManager.currentMode === this) {
			const { lastPlayedNetworkX, lastPlayedNetworkO, lastPlayedActivatedNodes, lastPlayedActivatedConnections } = this.gameManager.trainingManager.getStats()

			if (lastPlayedNetworkX)
				this.visualizerX.updateNetworkVisualization(lastPlayedNetworkX, lastPlayedActivatedNodes, lastPlayedActivatedConnections)

			if (lastPlayedNetworkO)
				this.visualizerO.updateNetworkVisualization(lastPlayedNetworkO, lastPlayedActivatedNodes, lastPlayedActivatedConnections)

			const latestGame = this.gameManager.trainingManager.latestCompletedGame
			if (!this.isAnimationPlaying && this.autoEveAnimationPlaying && latestGame) {
				this.isAnimationPlaying = true
				this.gameManager.trainingManager.latestCompletedGame = null

				this.autoEveCurrentGame = latestGame.moves
				const onStepCallback = (currentStep, totalSteps) => {
					this.updateAutoEveStats()
					this.autoEveGameStep = currentStep

					// 获取当前步骤的激活数据
					const moveData = latestGame.moves[currentStep - 1]
					if (moveData && moveData.activations) {
						const stats = this.gameManager.trainingManager.getStats()
						const network = moveData.player === 'X' ? stats.lastPlayedNetworkX : stats.lastPlayedNetworkO
						if (network) {
							const visualizer = moveData.player === 'X' ? this.visualizerX : this.visualizerO
							visualizer.updateNetworkVisualization(
								network,
								moveData.activations.activatedNodes,
								moveData.activations.activatedConnections
							)
						}
					}
				}

				await this.gameManager.playHistory(latestGame.moves, 200, onStepCallback)
				if (latestGame.winner) await new Promise(resolve => setTimeout(resolve, 500))

				this.gameManager.uiManager.reset()

				this.autoEveCurrentGame = null
				this.isAnimationPlaying = false
			}

			await new Promise(resolve => setTimeout(resolve, 1000))
		}
	}

	updateAutoEveStats() {
		const progress = this.autoEveCurrentGame?.length > 0
			? ((this.autoEveGameStep + 1) / this.autoEveCurrentGame.length) * 100
			: 0

		const stats = this.gameManager.trainingManager.getStats()

		this.gameManager.uiManager.updateAutoEveStats({
			...stats,
			progress,
			averageFitnessHistory: stats.averageFitnessHistory
		})
	}

	toggleAnimation() {
		this.autoEveAnimationPlaying = !this.autoEveAnimationPlaying
		const toggleAnimationButton = document.getElementById('toggle-animation-button')
		if (toggleAnimationButton)
			toggleAnimationButton.querySelector('iconify-icon').setAttribute('icon', this.autoEveAnimationPlaying ? 'line-md:play-to-pause-transition' : 'line-md:pause-to-play-transition')
	}

	playNextGame() {
		if (this.isAnimationPlaying) {
			this.gameManager.stopReplay()
			this.gameManager.uiManager.reset()
			this.isAnimationPlaying = false
			this.autoEveCurrentGame = null
			this.autoEveGameStep = 0
		}
	}

	exportBestNetwork() {
		const population = this.gameManager.geneticAlgorithm.population
		if (population.length === 0) return null
		return population.reduce((prev, current) => prev.fitness > current.fitness ? prev : current)
	}

	importNetwork(network) {
		this.gameManager.geneticAlgorithm.population.push(network)
	}
}
