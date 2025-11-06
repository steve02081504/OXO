/**
 * AI基类
 */
export { AI } from './base-ai.mjs'
/**
 * 传统AI
 */
export { TraditionalAI } from './traditional-ai.mjs'
/**
 * 神经网络AI
 */
export { NeuralAI } from './neural-ai.mjs'
/**
 * 随机AI
 */
export { RandomAI } from './random-ai.mjs'
/**
 * 玩家输入适配器
 */
export { PlayerInputAdapter } from './player-input-adapter.mjs'
/**
 * 游戏模拟
 */
export { runGameSimulation } from './simulation-runner.mjs'

import { NeuralAI } from './neural-ai.mjs'
import { PlayerInputAdapter } from './player-input-adapter.mjs'
import { RandomAI } from './random-ai.mjs'
import { TraditionalAI } from './traditional-ai.mjs'

/**
 * @class AIFactory
 * @classdesc AI工厂，用于创建不同类型的AI实例。
 */
export class AIFactory {
	/**
	 * 创建一个传统的AI实例。
	 * @returns {TraditionalAI} 传统的AI实例。
	 */
	static createTraditionalAI() {
		return new TraditionalAI()
	}

	/**
	 * 创建一个神经网络AI实例。
	 * @param {object} network - 神经网络实例。
	 * @returns {NeuralAI} 神经网络AI实例。
	 */
	static createNeuralAI(network) {
		return new NeuralAI(network)
	}

	/**
	 * 创建一个随机AI实例。
	 * @returns {RandomAI} 随机AI实例。
	 */
	static createRandomAI() {
		return new RandomAI()
	}

	/**
	 * 创建一个玩家输入适配器实例。
	 * @param {object} gameManager - 游戏管理器实例。
	 * @returns {PlayerInputAdapter} 玩家输入适配器实例。
	 */
	static createPlayerInputAdapter(gameManager) {
		return new PlayerInputAdapter(gameManager)
	}
}
