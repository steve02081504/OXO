/**
 * @file 提供了对神经网络应用棋盘对称变换的功能。
 */

// 棋盘索引 (0-8) 的8种对称变换映射
const symmetries = [
	// 0: 原始形态 (Identity)
	[0, 1, 2, 3, 4, 5, 6, 7, 8],
	// 1: 顺时针旋转90度 (Rotate 90°)
	[6, 3, 0, 7, 4, 1, 8, 5, 2],
	// 2: 旋转180度 (Rotate 180°)
	[8, 7, 6, 5, 4, 3, 2, 1, 0],
	// 3: 顺时针旋转270度 (Rotate 270°)
	[2, 5, 8, 1, 4, 7, 0, 3, 6],
	// 4: 水平镜像 (Flip Horizontal)
	[2, 1, 0, 5, 4, 3, 8, 7, 6],
	// 5: 垂直镜像 (Flip Vertical)
	[6, 7, 8, 3, 4, 5, 0, 1, 2],
	// 6: 主对角线镜像 (Flip Main Diagonal)
	[0, 3, 6, 1, 4, 7, 2, 5, 8],
	// 7: 副对角线镜像 (Flip Anti-Diagonal)
	[8, 5, 2, 7, 4, 1, 6, 3, 0]
]

/**
 * 对神经网络的输入和输出节点应用一次随机的棋盘对称变换。
 * 这会重新连接I/O，使得网络学习到策略的泛化。
 * @param {import('./neural-network.mjs').NeuralNetwork} network - 要进行变换的神经网络。
 * @returns {import('./neural-network.mjs').NeuralNetwork} - 返回变换后的网络 (原地修改)。
 */
export function applyRandomSymmetry(network) {
	// 1. 随机选择一个变换映射
	const transformMap = symmetries[Math.floor(Math.random() * symmetries.length)]

	// 如果是原始形态，则无需任何操作
	if (transformMap.every((val, idx) => val === idx)) return network

	const { inputNodeIds, outputNodeIds, nodes } = network

	// 2. 变换输入连接：
	// 核心思想：原本连接到输入节点 `i` 的连接，现在应该连接到代表新位置 `transformMap[i]` 的输入节点。
	const inputIdRemap = {}
	for (let i = 0; i < inputNodeIds.length; i++) {
		const originalInputId = inputNodeIds[i]
		const targetInputId = inputNodeIds[transformMap[i]]
		inputIdRemap[originalInputId] = targetInputId
	}

	// 遍历所有非输入节点，更新它们的输入源
	for (const node of nodes.values()) {
		if (node.constructor.name === 'InputNode') continue
		node.inputs = node.inputs.map(inputId => inputIdRemap[inputId] || inputId)
	}

	// 3. 变换输出连接：
	// 核心思想：原本用于计算输出 `i` 的逻辑（即连接到输出节点 `i` 的隐藏节点），现在应该用于计算新位置 `transformMap[i]` 的输出。
	// 这意味着我们需要交换输出节点们的输入源。

	// 首先，保存所有输出节点当前的输入连接
	const originalOutputInputs = outputNodeIds.map(id => nodes.get(id).inputs)

	// 然后，根据变换规则重新分配这些连接
	const newOutputInputs = new Array(outputNodeIds.length)
	for (let i = 0; i < outputNodeIds.length; i++)
		newOutputInputs[transformMap[i]] = originalOutputInputs[i]

	// 最后，将新的连接应用到输出节点上
	for (let i = 0; i < outputNodeIds.length; i++)
		nodes.get(outputNodeIds[i]).inputs = newOutputInputs[i]

	// 此变换不改变网络的拓扑结构，仅改变输入输出的“标签”，
	// 因此不需要调用 network.updateTopologicalOrder()，这有助于性能。
	return network
}
