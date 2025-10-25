import { Node } from './base-node.mjs'

/**
 * 记忆节点
 * 输出上一次存储的值，并将当前输入值存入。
 * 这是一个有状态的节点。
 */
export class MemoryNode extends Node {
	constructor(id, initialState = 0) {
		super(id)
		// 状态必须存储在 parameters 对象中，这样才能被 toJSON/fromJSON 正确序列化
		this.parameters.memoryState = initialState
	}

	evaluate(nodeMap) {
		// 输出上一次的状态
		this.value = this.parameters.memoryState

		// 如果有输入，则更新状态以备下次使用
		if (this.inputs.length > 0) {
			const inputNode = nodeMap.get(this.inputs[0])
			if (inputNode)
				this.parameters.memoryState = inputNode.value
		}
		return this.value
	}
}


/**
 * 锁存器节点
 * 当 gate 输入 > 0.5 时，用 data 输入更新内部状态。
 * 总是输出当前内部状态的值。
 */
export class LatchNode extends Node {
	constructor(id, initialState = 0) {
		super(id)
		// 状态必须存储在 parameters 对象中
		this.parameters.latchedValue = initialState
	}

	evaluate(nodeMap) {
		// 至少需要两个输入: [data, gate]
		if (this.inputs.length >= 2) {
			const dataNode = nodeMap.get(this.inputs[0])
			const gateNode = nodeMap.get(this.inputs[1])

			if (dataNode && gateNode)
				// 当 gate 输入大于 0.5 时，更新锁存的值
				if (gateNode.value > 0.5)
					this.parameters.latchedValue = dataNode.value
		}

		// 总是输出当前锁存的值
		this.value = this.parameters.latchedValue
		return this.value
	}
}
