import { Node } from './base-node.mjs'

/**
 * @class RandomNode
 * @classdesc 随机节点。输出一个高斯分布的随机数。
 * @extends Node
 */
export class RandomNode extends Node {
	/**
	 * @constructor
	 * @param {string} id - 节点ID。
	 */
	constructor(id) {
		super(id)
	}

	/**
	 * @override
	 */
	evaluate() {
		// 复用 NeuralNetwork 中的高斯随机函数，或直接用 Math.random()
		// Math.random() * 2 - 1  // 输出 [-1, 1] 的均匀分布随机数
		this.value = this.gaussianRandom() // 输出更平滑的高斯分布随机数
		return this.value
	}

	/**
	 * 生成高斯随机数。
	 * @returns {number} - [-1, 1] 之间的高斯随机数。
	 */
	gaussianRandom() {
		let u = 0, v = 0
		while (u === 0) u = Math.random()
		while (v === 0) v = Math.random()
		let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
		num = num / 10.0 + 0.5
		if (num > 1 || num < 0) return this.gaussianRandom()
		return num * 2 - 1 // 缩放到 [-1, 1]
	}
}
