import { AIFactory } from '../../ai/index.mjs'
import { NeuralNetwork } from '../../neural/neural-network.mjs'

import { BaseMode } from './base-mode.mjs'

export class EVEMode extends BaseMode {
	async initialize(gameManager, options = {}) {
		await super.initialize(gameManager, options)
		this.gameManager.uiManager.hideAllControls()
		this.gameManager.uiManager.showView('game-view')
		let { networkX, networkO } = options

		// 假设 gameManager 持有 gaInstance
		const ga = this.gameManager.gaInstance
		if (ga && ga.population.length > 1) {
			if (!networkX) {
				const randIndex = Math.floor(Math.random() * ga.population.length)
				networkX = ga.population[randIndex]
			}
			if (!networkO) {
				let randIndex = Math.floor(Math.random() * ga.population.length)
				// 确保两个网络不同
				while (ga.population[randIndex] === networkX)
					randIndex = Math.floor(Math.random() * ga.population.length)

				networkO = ga.population[randIndex]
			}
		}

		this.playerAIs = {
			X: AIFactory.createNeuralAI(networkX || new NeuralNetwork()),
			O: AIFactory.createNeuralAI(networkO || new NeuralNetwork())
		}

		this.gameManager.uiManager.displayVisualizationForPlayer('X', this.playerAIs.X.visualizer.createCanvasWithWrapper())
		this.gameManager.uiManager.displayVisualizationForPlayer('O', this.playerAIs.O.visualizer.createCanvasWithWrapper())

		this.gameManager.uiManager.showControlsForMode('eve')
		this.startAutoplay()
	}

	cleanup() {
		super.cleanup()
		this.gameManager.uiManager.hideAllControls()
		this.gameManager.uiManager.clearAllVisualizations()
	}

	startAutoplay() {
		// 移除 this.autoplayInterval
		const gameLoop = async () => {
			if (!this.gameManager.gameState.gameActive || this.gameManager.modeManager.currentMode !== this)
				return // 游戏结束或模式已切换，则停止循环

			const state = this.gameManager.gameState
			const ai = this.playerAIs[state.currentPlayer]
			await this.gameManager.handleAIMove(ai, state)

			// 再次调度下一次执行
			setTimeout(gameLoop, 500)
		}

		// 启动循环
		gameLoop()
	}
}
