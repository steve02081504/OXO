import { Node } from './base-node.mjs'

/**
 * @class InputNode
 * @classdesc 输入节点。
 * @augments Node
 */
export class InputNode extends Node {
	/**
	 * @class
	 * @param {string} id - 节点ID。
	 * @param {number} index - 输入索引。
	 */
	constructor(id, index) {
		super(id)
		this.parameters.index = index
	}

	/**
	 * @override
	 */
	evaluate(nodeMap, inputs) {
		this.value = inputs[this.parameters.index]
		return this.value
	}
}

/**
 * @class ConstantNode
 * @classdesc 常量节点。
 * @augments Node
 */
export class ConstantNode extends Node {
	/**
	 * @class
	 * @param {string} id - 节点ID。
	 * @param {number} value - 常量值。
	 */
	constructor(id, value) {
		super(id)
		this.parameters.value = value
	}

	/**
	 * @override
	 */
	evaluate() {
		this.value = this.parameters.value
		return this.value
	}
}

/**
 * @class OutputNode
 * @classdesc 输出节点。
 * @augments Node
 */
export class OutputNode extends Node {
	/**
	 * @class
	 * @param {string} id - 节点ID。
	 * @param {number} outputIndex - 输出索引。
	 */
	constructor(id, outputIndex) {
		super(id)
		this.parameters.outputIndex = outputIndex
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
		this.value = inputNode.value
		return this.value
	}
}
