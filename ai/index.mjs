/**
 * @fileoverview AI模块入口
 * @desc AI模块入口
 */
export { AI } from './base-ai.mjs'
export { TraditionalAI } from './traditional-ai.mjs'
export { NeuralAI } from './neural-ai.mjs'
export { RandomAI } from './random-ai.mjs'
export { PlayerInputAdapter } from './player-input-adapter.mjs'
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
	 * @returns {TraditionalAI}
	 */
	static createTraditionalAI() {
		return new TraditionalAI()
	}

	/**
	 * 创建一个神经网络AI实例。
	 * @param {object} network - 神经网络实例。
	 * @returns {NeuralAI}
	 */
	static createNeuralAI(network) {
		return new NeuralAI(network)
	}

	/**
	 * 创建一个随机AI实例。
	 * @returns {RandomAI}
	 */
	static createRandomAI() {
		return new RandomAI()
	}

	/**
	 * 创建一个玩家输入适配器实例。
	 * @param {object} gameManager - 游戏管理器实例。
	 * @returns {PlayerInputAdapter}
	 */
	static createPlayerInputAdapter(gameManager) {
		return new PlayerInputAdapter(gameManager)
	}
}
