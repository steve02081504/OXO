import { NetworkEvolver } from './network-evolver.mjs'
import { InputNode, ConstantNode, OutputNode, NodeFactory } from './nodes/index.mjs'

export class NeuralNetwork {
	constructor(config = {}) {
		this.config = {
			inputSize: 9,
			outputSize: 9,
			...config
		}

		this.nodes = new Map()
		this.inputNodeIds = []
		this.outputNodeIds = []
		this.fitness = 0
		this.thinkingIterations = Math.floor(Math.random() * 21) + 40 // Random between 40 and 60

		// 缓存拓扑排序结果
		this.topologicalOrder = null

		// 自适应进化参数：控制每个突变类型的发生概率
		// 这些参数本身也可以通过进化算法进行调整，实现meta-evolution
		this.evolvability = {
			weights: Math.random() * 0.2 + 0.1, // 权重突变概率 (0.1 to 0.3)
			constants: Math.random() * 0.2 + 0.1, // 常数节点值突变概率
			thinkingIterations: Math.random() * 0.2 + 0.1, // 思考迭代次数突变概率
			add_node: Math.random() * 0.1 + 0.05, // 添加节点突变概率 (0.05 to 0.15)
			remove_node: Math.random() * 0.1 + 0.05, // 移除节点突变概率
			add_connection: Math.random() * 0.1 + 0.05, // 添加连接突变概率
			remove_connection: Math.random() * 0.1 + 0.05, // 移除连接突变概率
			change_node_type: Math.random() * 0.1 + 0.05, // 改变节点类型突变概率
		}

		// 突变强度参数：控制突变时的变化幅度
		// 这些参数也通过进化算法进行调整，实现自适应突变强度
		this.mutationStrength = {
			weights: Math.random() * 0.5 + 0.2, // 权重突变强度 (0.2 to 0.7)
			constants: Math.random() * 0.5 + 0.2, // 常数节点值突变强度
			thinkingIterations: Math.random() * 0.5 + 0.2, // 思考迭代次数突变强度
			add_node: Math.random() * 0.5 + 0.2, // 结构突变强度
			remove_node: Math.random() * 0.5 + 0.2,
			add_connection: Math.random() * 0.5 + 0.2,
			remove_connection: Math.random() * 0.5 + 0.2,
			change_node_type: Math.random() * 0.5 + 0.2,
		}

		this.buildInitialNetwork()
	}

	buildInitialNetwork() {
		this.nodes.clear()
		this.inputNodeIds = []
		this.outputNodeIds = []

		for (let i = 0; i < this.config.inputSize; i++) {
			const inputNode = new InputNode(undefined, i)
			this.nodes.set(inputNode.id, inputNode)
			this.inputNodeIds.push(inputNode.id)
		}

		for (let i = 0; i < this.config.outputSize; i++) {
			const outputNode = new OutputNode(undefined, i)
			const randomInputNodeId = this.inputNodeIds[Math.floor(Math.random() * this.inputNodeIds.length)]
			outputNode.inputs.push(randomInputNodeId)
			this.nodes.set(outputNode.id, outputNode)
			this.outputNodeIds.push(outputNode.id)
		}

		// 初始化时计算并缓存拓扑排序
		this.updateTopologicalOrder()
	}

	/**
	 * 更新缓存的拓扑排序
	 */
	updateTopologicalOrder() {
		this.topologicalOrder = this.computeTopologicalOrder()
	}

	/**
	 * 计算网络的拓扑排序。
	 * 如果网络包含循环，则会检测到并返回一个标志。
	 * @returns {{order: Array<string>, hasCycle: boolean}} - 包含节点ID的拓扑顺序和循环检测标志。
	 */
	computeTopologicalOrder() {
		const inDegree = new Map()
		const graph = new Map() // Adjacency list representation

		// Initialize in-degrees and graph
		this.nodes.forEach(node => {
			inDegree.set(node.id, 0)
			graph.set(node.id, [])
		})

		this.nodes.forEach(node => {
			node.inputs.forEach(inputId => {
				// Ensure inputId exists as a node in the network
				if (this.nodes.has(inputId)) {
					graph.get(inputId).push(node.id)
					inDegree.set(node.id, inDegree.get(node.id) + 1)
				}
			})
		})

		const queue = []
		inDegree.forEach((degree, nodeId) => {
			if (degree === 0)
				queue.push(nodeId)
		})

		const topologicalOrder = []
		let visitedNodesCount = 0

		while (queue.length > 0) {
			const u = queue.shift()
			topologicalOrder.push(u)
			visitedNodesCount++

			graph.get(u).forEach(v => {
				inDegree.set(v, inDegree.get(v) - 1)
				if (inDegree.get(v) === 0)
					queue.push(v)
			})
		}

		if (visitedNodesCount !== this.nodes.size)
			return { order: topologicalOrder, hasCycle: true }
		else
			return { order: topologicalOrder, hasCycle: false }
	}

	/**
	 * 前向传播：计算网络输出
	 * 通过拓扑排序评估节点，确保每个节点在一次迭代中只执行一次。
	 * 如果检测到循环依赖，将发出警告，并尽可能地进行单次评估。
	 * @param {Array} inputs - 输入值数组
	 * @returns {Object} - 包含输出值、激活节点和激活连接的对象
	 */
	forward(inputs) {
		// 重置所有节点值
		this.nodes.forEach(node => node.value = 0)

		const outputValues = new Array(this.config.outputSize).fill(0)
		const activatedNodes = []
		const activatedConnections = []

		const { order: topologicalOrder, hasCycle } = this.topologicalOrder

		if (hasCycle)
			console.warn('Cycle detected in the neural network. Nodes within the cycle might not be fully evaluated in a single pass according to topological order.')

		// Evaluate nodes in topological order
		for (const nodeId of topologicalOrder) {
			const node = this.nodes.get(nodeId)

			node.evaluate(this.nodes, inputs)
			activatedNodes.push(node.id)

			// Track activated connections
			node.inputs.forEach((inputId, index) => {
				const fromNode = this.nodes.get(inputId)
				if (fromNode)
					activatedConnections.push({
						from: fromNode.id,
						to: node.id,
						weight: node.parameters.weights ? node.parameters.weights[index] : 1.0
					})

			})

			// Collect output node values
			if (node instanceof OutputNode)
				outputValues[node.parameters.outputIndex] = node.value

		}

		return { outputValues, activatedNodes, activatedConnections }
	}

	toJSON() {
		return {
			config: this.config,
			nodes: Array.from(this.nodes.values()).map(node => node.toJSON()),
			inputNodeIds: this.inputNodeIds,
			outputNodeIds: this.outputNodeIds,
			fitness: this.fitness,
			thinkingIterations: this.thinkingIterations,
			evolvability: this.evolvability,
			mutationStrength: this.mutationStrength
		}
	}

	static fromJSON(json) {
		const network = new NeuralNetwork(json.config)
		network.nodes.clear()

		const nodeMap = new Map()
		json.nodes.forEach(nodeData => {
			const node = NodeFactory.fromJSON(nodeData, nodeMap)
			nodeMap.set(node.id, node)
		})
		network.nodes = nodeMap

		network.inputNodeIds = json.inputNodeIds
		network.outputNodeIds = json.outputNodeIds
		network.fitness = json.fitness || 0
		network.thinkingIterations = json.thinkingIterations || 1
		const defaultEvolvability = {
			weights: Math.random() * 0.2 + 0.1,
			constants: Math.random() * 0.2 + 0.1,
			thinkingIterations: Math.random() * 0.2 + 0.1,
			add_node: Math.random() * 0.1 + 0.05,
			remove_node: Math.random() * 0.1 + 0.05,
			add_connection: Math.random() * 0.1 + 0.05,
			remove_connection: Math.random() * 0.1 + 0.05,
			change_node_type: Math.random() * 0.1 + 0.05,
		}

		const defaultMutationStrength = {
			weights: Math.random() * 0.5 + 0.2,
			constants: Math.random() * 0.5 + 0.2,
			thinkingIterations: Math.random() * 0.5 + 0.2,
			add_node: Math.random() * 0.5 + 0.2,
			remove_node: Math.random() * 0.5 + 0.2,
			add_connection: Math.random() * 0.5 + 0.2,
			remove_connection: Math.random() * 0.5 + 0.2,
			change_node_type: Math.random() * 0.5 + 0.2,
		}

		network.evolvability = { ...defaultEvolvability, ...json.evolvability || {} }
		network.mutationStrength = { ...defaultMutationStrength, ...json.mutationStrength || {} }

		network.updateTopologicalOrder()
		return network
	}

	static async fromUrl(url) {
		try {
			const response = await fetch(url)
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
			const networkData = await response.json()
			return NeuralNetwork.fromJSON(networkData)
		} catch (error) {
			console.error(`Failed to load network from ${url}:`, error)
			return null
		}
	}

	clone() {
		const clonedNetwork = new NeuralNetwork(this.config)
		clonedNetwork.nodes.clear()

		this.nodes.forEach(node => {
			const clonedNode = new node.constructor(node.id)
			Object.assign(clonedNode, JSON.parse(JSON.stringify(node)))
			clonedNetwork.nodes.set(clonedNode.id, clonedNode)
		})

		clonedNetwork.inputNodeIds = [...this.inputNodeIds]
		clonedNetwork.outputNodeIds = [...this.outputNodeIds]
		clonedNetwork.fitness = this.fitness
		clonedNetwork.thinkingIterations = this.thinkingIterations
		clonedNetwork.evolvability = JSON.parse(JSON.stringify(this.evolvability))
		clonedNetwork.mutationStrength = JSON.parse(JSON.stringify(this.mutationStrength))

		// 克隆时复制缓存状态
		clonedNetwork.topologicalOrder = this.topologicalOrder
		return clonedNetwork
	}

	getHiddenNodes() {
		return Array.from(this.nodes.values()).filter(node =>
			!(node instanceof InputNode) && !(node instanceof OutputNode)
		)
	}

	getConnections() {
		const connections = []
		this.nodes.forEach(node => {
			node.inputs.forEach((inputId, index) => {
				const fromNode = this.nodes.get(inputId)
				if (fromNode)
					connections.push({
						from: fromNode,
						to: node,
						weight: node.parameters.weights ? node.parameters.weights[index] : 1.0
					})

			})
		})
		return connections
	}

	getAvailableSourceNodes() {
		return Array.from(this.nodes.values()).filter(node => !(node instanceof OutputNode))
	}

	getAvailableTargetNodes() {
		return Array.from(this.nodes.values()).filter(node => !(node instanceof InputNode) && !(node instanceof ConstantNode))
	}

	/**
	 * 突变：应用随机变化到网络结构和参数
	 * 委托给 NetworkEvolver 类处理
	 */
	mutate() {
		NetworkEvolver.mutate(this)
		this.updateTopologicalOrder()
	}

	/**
	 * 交叉：与另一个网络结合产生子代
	 * 委托给 NetworkEvolver 类处理
	 * @param {NeuralNetwork} partner - 配对的网络
	 * @returns {NeuralNetwork} - 子代网络
	 */
	crossover(partner) {
		return NetworkEvolver.crossover(this, partner)
	}

	static gaussianRandom() {
		let u = 0, v = 0
		while (u === 0) u = Math.random() // Converting [0,1) to (0,1)
		while (v === 0) v = Math.random()
		let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
		num = num / 10.0 + 0.5 // Scale to 0-1, then to desired mean and std_dev
		if (num > 1 || num < 0) return NeuralNetwork.gaussianRandom() // Resample between 0 and 1
		return num
	}
}
