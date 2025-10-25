export class Node {
	constructor(id = Math.random().toString(36).substr(2, 9)) {
		this.id = id
		this.value = 0
		this.inputs = []
		this.parameters = {}
		this.type = this.constructor.name
	}

	evaluate(nodeMap, inputs) {
		throw new Error('Evaluate method must be implemented by subclasses')
	}

	toJSON() {
		return {
			id: this.id,
			type: this.type,
			inputs: this.inputs,
			parameters: this.parameters
		}
	}
}
