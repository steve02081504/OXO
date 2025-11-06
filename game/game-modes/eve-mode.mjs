import { AIFactory } from '../../ai/index.mjs'
import { NeuralNetwork } from '../../neural/neural-network.mjs'

import { BaseMode } from './base-mode.mjs'

/**
 * @class EVEMode
 * @classdesc EVE模式，用于AI与AI之间的对战。
 * @extends BaseMode
 */
export class EVEMode extends BaseMode {
	/**
	 * 初始化EVEMode。
	 * @param {object} gameManager - 游戏管理器实例。
	 * @param {object} options - 初始化选项。
	 */
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

	/**
	 * 决定使用哪个神经网络。
	 * @param {object} options - 包含网络选项的对象。
	 * @returns {{networkX: NeuralNetwork, networkO: NeuralNetwork}} 包含X和O玩家网络的神经网络对象。
	 */
	determineNetworks(options) {
		let { networkX, networkO } = options
		const ga = this.gameManager.geneticAlgorithm

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

	/**
	 * 处理URL参数，加载指定的神经网络。
	 * @param {object} options - 包含URL参数的对象。
	 */
	async handleUrlParams(options) {
		/**
		 * 异步加载并设置AI。
		 * @param {string} player - 玩家（'X' 或 'O'）。
		 * @param {string} url - 神经网络模型的URL。
		 */
		const loadAndSetAI = async (player, url) => {
			if (url) try {
				this.playerAIs[player] = AIFactory.createNeuralAI(await NeuralNetwork.fromUrl(url))
			} catch (error) {
				alert(`Failed to load network for player ${player} from ${url}:\n${error.message}`)
			}
		}

		await Promise.all([
			loadAndSetAI('X', options.networkUrlX),
			loadAndSetAI('O', options.networkUrlO)
		])
	}

	/**
	 * 清理模式，隐藏所有控件和可视化。
	 */
	cleanup() {
		super.cleanup()
		this.gameManager.uiManager.hideAllControls()
		this.gameManager.uiManager.clearAllVisualizations()
	}


	/**
	 * 启动自动播放，让AI之间进行对战。
	 */
	startAutoplay() {
		/**
		 * 游戏循环，用于驱动AI移动。
		 */
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
