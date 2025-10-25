import { Node } from './base-node.mjs'

export class InputNode extends Node {
	constructor(id, index) {
		super(id)
		this.parameters.index = index
	}
	evaluate(nodeMap, inputs) {
		this.value = inputs[this.parameters.index]
		return this.value
	}
}

export class ConstantNode extends Node {
	constructor(id, value) {
		super(id)
		this.parameters.value = value
	}
	evaluate() {
		this.value = this.parameters.value
		return this.value
	}
}

export class OutputNode extends Node {
	constructor(id, outputIndex) {
		super(id)
		this.parameters.outputIndex = outputIndex
	}
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
