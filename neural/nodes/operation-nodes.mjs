import { Node } from './base-node.mjs'

/**
 * @class AddNode
 * @classdesc 加法节点。
 * @augments Node
 */
export class AddNode extends Node {
	/**
	 * @class
	 * @param {string} id - 节点ID。
	 */
	constructor(id) {
		super(id)
		this.parameters.weights = []
	}

	/**
	 * @override
	 */
	evaluate(nodeMap) {
		let sum = 0
		for (let i = 0; i < this.inputs.length; i++) {
			const inputNode = nodeMap.get(this.inputs[i])
			sum += inputNode.value * (this.parameters.weights[i] || 1)
		}
		this.value = sum
		return this.value
	}
}

/**
 * @class SubtractNode
 * @classdesc 减法节点。
 * @augments Node
 */
export class SubtractNode extends Node {
	/**
	 * @class
	 * @param {string} id - 节点ID。
	 */
	constructor(id) {
		super(id)
		this.parameters.weights = []
	}

	/**
	 * @override
	 */
	evaluate(nodeMap) {
		if (this.inputs.length < 2) {
			this.value = 0
			return this.value
		}
		const inputNode1 = nodeMap.get(this.inputs[0])
		const inputNode2 = nodeMap.get(this.inputs[1])
		this.value = (inputNode1.value * (this.parameters.weights[0] || 1)) - (inputNode2.value * (this.parameters.weights[1] || 1))
		return this.value
	}
}

/**
 * @class MultiplyNode
 * @classdesc 乘法节点。
 * @augments Node
 */
export class MultiplyNode extends Node {
	/**
	 * @class
	 * @param {string} id - 节点ID。
	 */
	constructor(id) {
		super(id)
		this.parameters.weights = []
	}

	/**
	 * @override
	 */
	evaluate(nodeMap) {
		let product = 1
		for (let i = 0; i < this.inputs.length; i++) {
			const inputNode = nodeMap.get(this.inputs[i])
			product *= inputNode.value * (this.parameters.weights[i] || 1)
		}
		this.value = product
		return this.value
	}
}

/**
 * @class DivideNode
 * @classdesc 除法节点。
 * @augments Node
 */
export class DivideNode extends Node {
	/**
	 * @class
	 * @param {string} id - 节点ID。
	 */
	constructor(id) {
		super(id)
		this.parameters.weights = []
	}

	/**
	 * @override
	 */
	evaluate(nodeMap) {
		if (this.inputs.length < 2) {
			this.value = 0
			return this.value
		}
		const inputNode1 = nodeMap.get(this.inputs[0])
		const inputNode2 = nodeMap.get(this.inputs[1])
		const divisor = inputNode2.value * (this.parameters.weights[1] || 1)
		this.value = divisor !== 0 ? (inputNode1.value * (this.parameters.weights[0] || 1)) / divisor : 0
		return this.value
	}
}

/**
 * @class SinNode
 * @classdesc 正弦节点。
 * @augments Node
 */
export class SinNode extends Node {
	/**
	 * @class
	 * @param {string} id - 节点ID。
	 */
	constructor(id) {
		super(id)
	}

	/**
	 * @override
	 */
	evaluate(nodeMap) {
		if (!this.inputs.length) {
			this.value = 0
			return this.value
		}
		const inputNode = nodeMap.get(this.inputs[0])
		this.value = Math.sin(inputNode.value)
		return this.value
	}
}

/**
 * @class CosNode
 * @classdesc 余弦节点。
 * @augments Node
 */
export class CosNode extends Node {
	/**
	 * @class
	 * @param {string} id - 节点ID。
	 */
	constructor(id) {
		super(id)
	}

	/**
	 * @override
	 */
	evaluate(nodeMap) {
		if (!this.inputs.length) {
			this.value = 0
			return this.value
		}
		const inputNode = nodeMap.get(this.inputs[0])
		this.value = Math.cos(inputNode.value)
		return this.value
	}
}
