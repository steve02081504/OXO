/**
 * @class Node
 * @classdesc 神经网络中节点基类。
 */
export class Node {
	/**
	 * @constructor
	 * @param {string} [id=Math.random().toString(36).substr(2, 9)] - 节点的唯一ID。
	 */
	constructor(id = Math.random().toString(36).substr(2, 9)) {
		this.id = id
		this.value = 0
		this.inputs = []
		this.parameters = {}
		this.type = this.constructor.name
	}

	/**
	 * 评估节点的值。
	 * @param {Map<string, Node>} nodeMap - 网络中所有节点的映射。
	 * @param {Array<number>} inputs - 网络的输入值。
	 */
	evaluate(nodeMap, inputs) {
		throw new Error('Evaluate method must be implemented by subclasses')
	}

	/**
	 * 将节点转换为JSON对象。
	 * @returns {object} 节点的JSON表示。
	 */
	toJSON() {
		return {
			id: this.id,
			type: this.type,
			inputs: this.inputs,
			parameters: this.parameters
		}
	}
}
