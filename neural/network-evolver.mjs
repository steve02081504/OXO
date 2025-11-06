import { GameConfig } from '../config.mjs'

import { NeuralNetwork } from './neural-network.mjs'
import { AddNode, SubtractNode, MultiplyNode, DivideNode, SinNode, CosNode, RandomNode, MemoryNode, LatchNode } from './nodes/index.mjs'
import { ConstantNode } from './nodes/io-nodes.mjs'
// 1. 导入所有节点类型

/**
 * @class NetworkEvolver
 * @classdesc 网络进化器：负责神经网络的突变和交叉操作。
 * 遵循单一职责原则，将进化逻辑从 NeuralNetwork 类中分离出来。
 */
export class NetworkEvolver {
	/**
	 * 突变网络结构和参数。
	 * @param {NeuralNetwork} network - 要突变的网络。
	 */
	static mutate(network) {
		/**
		 * 获取一个随机的突变值。
		 * @returns {number} 随机突变值。
		 */
		const getRandomMutationValue = () => {
			const multiplier = GameConfig.ai.mutation.gaussianMultiplier
			const offset = GameConfig.ai.mutation.gaussianOffset
			return NeuralNetwork.gaussianRandom() * multiplier - offset // 高斯随机数 [-offset, offset]
		}

		// 应用突变的辅助函数
		/**
		 * 应用突变。
		 * @param {number} value - 要突变的值。
		 * @param {string} evolvabilityKey - 可进化性键。
		 * @param {string} mutationStrengthKey - 突变强度键。
		 * @param {number} [min=-Infinity] - 最小值。
		 * @param {number} [max=Infinity] - 最大值。
		 * @returns {number} 突变后的值。
		 */
		const applyMutation = (value, evolvabilityKey, mutationStrengthKey, min = -Infinity, max = Infinity) => {
			if (NeuralNetwork.gaussianRandom() < network.evolvability[evolvabilityKey]) {
				const change = getRandomMutationValue() * network.mutationStrength[mutationStrengthKey]
				const newValue = value + value * change
				return Math.max(min, Math.min(max, newValue))
			}
			return value
		}

		// 突变权重和常数节点值
		network.nodes.forEach(node => {
			if (node.parameters.weights)
				node.parameters.weights = node.parameters.weights.map(weight =>
					applyMutation(weight, 'weights', 'weights')
				)
			else if (node instanceof ConstantNode)
				node.parameters.value = applyMutation(node.parameters.value, 'constants', 'constants')

		})

		// 突变思考迭代次数
		network.thinkingIterations = Math.floor(applyMutation(network.thinkingIterations, 'thinkingIterations', 'thinkingIterations', 1, 100))

		// 突变进化能力元参数 (meta-evolution)
		for (const key in network.evolvability)
			if (Object.hasOwnProperty.call(network.evolvability, key))
				network.evolvability[key] = applyMutation(network.evolvability[key], key, key)

		// 突变突变强度元参数 (meta-evolution)
		for (const key in network.mutationStrength)
			if (Object.hasOwnProperty.call(network.mutationStrength, key))
				network.mutationStrength[key] = applyMutation(network.mutationStrength[key], key, key)

		// 结构突变
		if (NeuralNetwork.gaussianRandom() < network.evolvability.add_node) NetworkEvolver.addRandomNode(network)
		if (NeuralNetwork.gaussianRandom() < network.evolvability.remove_node) NetworkEvolver.removeRandomNode(network)
		if (NeuralNetwork.gaussianRandom() < network.evolvability.add_connection) NetworkEvolver.addRandomConnection(network)
		if (NeuralNetwork.gaussianRandom() < network.evolvability.remove_connection) NetworkEvolver.removeRandomConnection(network)
		if (NeuralNetwork.gaussianRandom() < network.evolvability.change_node_type) NetworkEvolver.changeRandomNodeType(network)
	}

	/**
	 * 交叉两个网络产生子代。
	 * @param {NeuralNetwork} parent1 - 父代网络1。
	 * @param {NeuralNetwork} parent2 - 父代网络2。
	 * @returns {NeuralNetwork} - 子代网络。
	 */
	static crossover(parent1, parent2) {
		const child = parent1.clone()

		// 随机选择父代的隐藏节点
		const childHiddenNodes = child.getHiddenNodes()
		childHiddenNodes.forEach(childNode => {
			if (Math.random() < 0.5) {
				const partnerNode = parent2.nodes.get(childNode.id)
				if (partnerNode) {
					const newChildNode = new partnerNode.constructor(partnerNode.id)
					Object.assign(newChildNode, JSON.parse(JSON.stringify(partnerNode)))
					child.nodes.set(newChildNode.id, newChildNode)
				}
			}
		})

		// 清理无效连接并调整权重
		child.nodes.forEach(node => {
			node.inputs = node.inputs.filter(inputId => child.nodes.has(inputId))
			if (node.parameters.weights) {
				while (node.parameters.weights.length < node.inputs.length) node.parameters.weights.push(Math.random() * 2 - 1)
				while (node.parameters.weights.length > node.inputs.length) node.parameters.weights.pop()
			}
		})

		return child
	}

	/**
	 * 向网络中添加一个随机节点。
	 * @param {NeuralNetwork} network - 要修改的网络。
	 */
	static addRandomNode(network) {
		const nodeTypes = [
			AddNode, SubtractNode, MultiplyNode, DivideNode, SinNode, CosNode,
			ConstantNode, RandomNode, MemoryNode, LatchNode
		]
		const NodeType = nodeTypes[Math.floor(Math.random() * nodeTypes.length)]
		let newNode

		if (NodeType === ConstantNode)
			newNode = new ConstantNode(undefined, Math.random() * 2 - 1)
		else if (NodeType === RandomNode)
			newNode = new RandomNode()
		else if (NodeType === SinNode || NodeType === CosNode || NodeType === MemoryNode) { // 单输入节点
			const sourceNodes = network.getAvailableSourceNodes()
			if (sourceNodes.length === 0) return
			const randomSource = sourceNodes[Math.floor(Math.random() * sourceNodes.length)]
			newNode = new NodeType()
			newNode.inputs.push(randomSource.id)
		} else if (NodeType === AddNode || NodeType === MultiplyNode) { // 多输入节点
			const sourceNodes = network.getAvailableSourceNodes()
			const numInputs = Math.floor(Math.random() * 4) + 2 // 2 to 5 inputs
			if (sourceNodes.length < numInputs) return

			newNode = new NodeType()
			const chosenSources = new Set()
			while (chosenSources.size < numInputs) {
				const randomSource = sourceNodes[Math.floor(Math.random() * sourceNodes.length)]
				if (!chosenSources.has(randomSource.id)) {
					chosenSources.add(randomSource.id)
					newNode.inputs.push(randomSource.id)
				}
			}
			if (newNode.parameters.weights)
				newNode.parameters.weights = newNode.inputs.map(() => Math.random() * 2 - 1)
		} else { // 双输入节点 (Subtract, Divide, LatchNode)
			const sourceNodes = network.getAvailableSourceNodes()
			if (sourceNodes.length < 2) return
			const randomSource1 = sourceNodes[Math.floor(Math.random() * sourceNodes.length)]
			let randomSource2 = sourceNodes[Math.floor(Math.random() * sourceNodes.length)]
			while (randomSource1.id === randomSource2.id && sourceNodes.length > 1)
				randomSource2 = sourceNodes[Math.floor(Math.random() * sourceNodes.length)]

			newNode = new NodeType()
			// LatchNode 的输入顺序是 [data, gate]，这里我们随机分配
			newNode.inputs.push(randomSource1.id, randomSource2.id)
			if (newNode.parameters.weights)
				newNode.parameters.weights = newNode.inputs.map(() => Math.random() * 2 - 1)
		}

		if (newNode)
			network.nodes.set(newNode.id, newNode)
	}

	/**
	 * 从网络中移除一个随机节点。
	 * @param {NeuralNetwork} network - 要修改的网络。
	 */
	static removeRandomNode(network) {
		const hiddenNodes = network.getHiddenNodes()
		if (hiddenNodes.length === 0) return

		const nodeToRemove = hiddenNodes[Math.floor(Math.random() * hiddenNodes.length)]
		network.nodes.delete(nodeToRemove.id)

		network.nodes.forEach(node => {
			node.inputs = node.inputs.filter(inputId => inputId !== nodeToRemove.id)
		})
	}

	/**
	 * 向网络中添加一个随机连接。
	 * @param {NeuralNetwork} network - 要修改的网络。
	 */
	static addRandomConnection(network) {
		const sourceNodes = network.getAvailableSourceNodes()
		const targetNodes = network.getAvailableTargetNodes()
		if (sourceNodes.length === 0 || targetNodes.length === 0) return

		const source = sourceNodes[Math.floor(Math.random() * sourceNodes.length)]
		const target = targetNodes[Math.floor(Math.random() * targetNodes.length)]

		if (source.id === target.id) return

		if (!target.inputs.includes(source.id)) {
			target.inputs.push(source.id)
			if (target.parameters.weights)
				target.parameters.weights.push(Math.random() * 2 - 1)
		}
	}

	/**
	 * 从网络中移除一个随机连接。
	 * @param {NeuralNetwork} network - 要修改的网络。
	 */
	static removeRandomConnection(network) {
		const targetNodes = network.getAvailableTargetNodes()
		const nodesWithConnections = targetNodes.filter(node => node.inputs.length > 0)
		if (nodesWithConnections.length === 0) return

		const nodeToModify = nodesWithConnections[Math.floor(Math.random() * nodesWithConnections.length)]
		const connectionIndex = Math.floor(Math.random() * nodeToModify.inputs.length)

		nodeToModify.inputs.splice(connectionIndex, 1)
		if (nodeToModify.parameters.weights && nodeToModify.parameters.weights.length > connectionIndex)
			nodeToModify.parameters.weights.splice(connectionIndex, 1)
	}

	/**
	 * 随机改变网络中一个节点的类型。
	 * @param {NeuralNetwork} network - 要修改的网络。
	 */
	static changeRandomNodeType(network) {
		const hiddenNodes = network.getHiddenNodes()
		if (hiddenNodes.length === 0) return

		const nodeToChange = hiddenNodes[Math.floor(Math.random() * hiddenNodes.length)]
		const oldType = nodeToChange.type

		const possibleTypes = [AddNode, SubtractNode, MultiplyNode, DivideNode, SinNode, CosNode, ConstantNode, RandomNode, MemoryNode, LatchNode]
		const newTypeClass = possibleTypes[Math.floor(Math.random() * possibleTypes.length)]

		if (oldType === newTypeClass.name) return

		const newNode = new newTypeClass(nodeToChange.id)
		newNode.inputs = [...nodeToChange.inputs]

		if (newNode.parameters.weights && !nodeToChange.parameters.weights)
			newNode.parameters.weights = newNode.inputs.map(() => Math.random() * 2 - 1)
		else if (!newNode.parameters.weights && nodeToChange.parameters.weights)
			newNode.parameters.weights = []
		else if (newNode.parameters.weights && nodeToChange.parameters.weights) {
			newNode.parameters.weights = [...nodeToChange.parameters.weights]
			while (newNode.parameters.weights.length < newNode.inputs.length) newNode.parameters.weights.push(Math.random() * 2 - 1)
			while (newNode.parameters.weights.length > newNode.inputs.length) newNode.parameters.weights.pop()
		}

		if (newNode instanceof ConstantNode && !(nodeToChange instanceof ConstantNode))
			newNode.parameters.value = Math.random() * 2 - 1
		else if (!(newNode instanceof ConstantNode) && nodeToChange instanceof ConstantNode)
			delete newNode.parameters.value

		// Handle stateful nodes' initial state if changing to/from them
		if (newNode instanceof MemoryNode && !(nodeToChange instanceof MemoryNode))
			newNode.parameters.memoryState = 0
		else if (!(newNode instanceof MemoryNode) && nodeToChange instanceof MemoryNode)
			delete newNode.parameters.memoryState


		if (newNode instanceof LatchNode && !(nodeToChange instanceof LatchNode))
			newNode.parameters.latchedValue = 0
		else if (!(newNode instanceof LatchNode) && nodeToChange instanceof LatchNode)
			delete newNode.parameters.latchedValue


		network.nodes.set(newNode.id, newNode)
	}
}
