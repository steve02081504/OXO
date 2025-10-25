import { Node } from './base-node.mjs'

export class AddNode extends Node {
	constructor(id) {
		super(id)
		this.parameters.weights = []
	}
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

export class SubtractNode extends Node {
	constructor(id) {
		super(id)
		this.parameters.weights = []
	}
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

export class MultiplyNode extends Node {
	constructor(id) {
		super(id)
		this.parameters.weights = []
	}
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

export class DivideNode extends Node {
	constructor(id) {
		super(id)
		this.parameters.weights = []
	}
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

export class SinNode extends Node {
	constructor(id) {
		super(id)
	}
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

export class CosNode extends Node {
	constructor(id) {
		super(id)
	}
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
