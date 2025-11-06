import { Node } from './base-node.mjs'
import { InputNode, OutputNode, ConstantNode } from './io-nodes.mjs'
import { AddNode, SubtractNode, MultiplyNode, DivideNode, SinNode, CosNode } from './operation-nodes.mjs'
import { MemoryNode, LatchNode } from './stateful-nodes.mjs'
import { RandomNode } from './stochastic-nodes.mjs'

/**
 * 导出所有节点类型
 */
export { Node, InputNode, ConstantNode, OutputNode, AddNode, SubtractNode, MultiplyNode, DivideNode, SinNode, CosNode, RandomNode, MemoryNode, LatchNode }

/**
 * @class NodeFactory
 * @classdesc 节点工厂，用于从JSON创建节点实例。
 */
export class NodeFactory {
	/**
	 * 从JSON对象创建节点实例。
	 * @param {object} json - 节点的JSON表示。
	 * @param {Map<string, Node>} nodeMap - 网络中所有节点的映射。
	 * @returns {Node} - 新的节点实例。
	 */
	static fromJSON(json, nodeMap) {
		let node
		switch (json.type) {
			case 'Node':
				node = new Node(json.id)
				break
			case 'InputNode':
				node = new InputNode(json.id)
				break
			case 'ConstantNode':
				node = new ConstantNode(json.id, json.parameters.value)
				break
			case 'OutputNode':
				node = new OutputNode(json.id)
				break
			case 'AddNode':
				node = new AddNode(json.id)
				break
			case 'SubtractNode':
				node = new SubtractNode(json.id)
				break
			case 'MultiplyNode':
				node = new MultiplyNode(json.id)
				break
			case 'DivideNode':
				node = new DivideNode(json.id)
				break
			case 'SinNode':
				node = new SinNode(json.id)
				break
			case 'CosNode':
				node = new CosNode(json.id)
				break
			case 'RandomNode':
				node = new RandomNode(json.id)
				break
			case 'MemoryNode':
				node = new MemoryNode(json.id, json.parameters.memoryState)
				break
			case 'LatchNode':
				node = new LatchNode(json.id, json.parameters.latchedValue)
				break
			default:
				throw new Error(`Unknown node type: ${json.type}`)
		}
		node.inputs = json.inputs
		node.parameters = json.parameters
		nodeMap.set(node.id, node)
		return node
	}
}
