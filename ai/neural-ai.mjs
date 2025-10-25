import { NeuralNetworkVisualizer } from '../ui/neural-network-visualizer.mjs'

import { AI } from './base-ai.mjs'

export class NeuralAI extends AI {
	constructor(network) {
		super()
		this.network = network
		this.activatedNodes = []
		this.activatedConnections = []
		this.visualizer = new NeuralNetworkVisualizer()
	}

	/**
	 * 用于在复用AI实例时更新其神经网络
	 * @param {NeuralNetwork} network - 新的神经网络
	 */
	setNetwork(network) {
		this.network = network
	}

	async getMove(gameState) {
		const { board, currentPlayer, moveHistory, activePieces } = gameState

		const availableCells = this.getAvailableCells(board)
		if (availableCells.length === 0) return -1

		const inputs = NeuralAI.generateNeuralInput(board, currentPlayer, moveHistory, activePieces)

		let outputs = []
		let activatedNodes = []
		let activatedConnections = []

		for (let i = 0; i < this.network.thinkingIterations; i++) {
			const result = this.network.forward(inputs)
			outputs = result.outputValues
			activatedNodes = result.activatedNodes
			activatedConnections = result.activatedConnections
		}

		this.activatedNodes = activatedNodes
		this.activatedConnections = activatedConnections

		// 更新自己的 visualizer
		this.visualizer.updateNetworkVisualization(
			this.network,
			activatedNodes,
			activatedConnections
		)

		// 优化后的逻辑：直接找到得分最高的移动
		let bestMove = availableCells[0]
		let maxScore = -Infinity

		for (const moveIndex of availableCells)
			if (outputs[moveIndex] > maxScore) {
				maxScore = outputs[moveIndex]
				bestMove = moveIndex
			}

		return bestMove
	}

	static generateNeuralInput(board, currentPlayer, moveHistory, activePieces) {
		const inputs = new Array(9).fill(0)
		const opponentPlayer = currentPlayer === 'X' ? 'O' : 'X'

		activePieces.forEach(piece => {
			if (piece.player === currentPlayer)
				inputs[piece.cellIndex] = piece.lifetime
			else if (piece.player === opponentPlayer)
				inputs[piece.cellIndex] = -piece.lifetime
		})

		return inputs
	}
}
