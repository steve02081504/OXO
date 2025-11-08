import { NeuralNetworkVisualizer } from '../ui/neural-network-visualizer.mjs'

import { AI } from './base-ai.mjs'

/**
 * @class NeuralAI
 * @classdesc 使用神经网络的AI。
 * @augments AI
 */
export class NeuralAI extends AI {
	/**
	 * @class
	 * @param {object} network - 神经网络实例。
	 */
	constructor(network) {
		super()
		this.network = network
		this.activatedNodes = []
		this.activatedConnections = []
		this.visualizer = new NeuralNetworkVisualizer()
	}

	/**
	 * 用于在复用AI实例时更新其神经网络。
	 * @param {object} network - 新的神经网络。
	 */
	setNetwork(network) {
		this.network = network
	}

	/**
	 * 在给定一个棋盘状态下，决定最佳的移动。
	 * 这是一个简化版本，主要用于训练场景，不考虑棋子寿命。
	 * @param {string[]} board - 棋盘状态。
	 * @param {string} currentPlayer - 当前玩家。
	 * @returns {number} 最佳移动的索引。
	 */
	decide(board, currentPlayer) {
		const availableCells = this.getAvailableCells(board)
		if (availableCells.length === 0) return -1

		// 为场景训练创建一个简化的输入
		const inputs = new Array(9).fill(0)
		const opponentPlayer = currentPlayer === 'X' ? 'O' : 'X'
		for (let i = 0; i < board.length; i++) 
			if (board[i] === currentPlayer)
				inputs[i] = 1 // 使用 1 代表自己的棋子
			else if (board[i] === opponentPlayer)
				inputs[i] = -1 // 使用 -1 代表对手的棋子
		

		const { outputValues } = this.network.forward(inputs)

		// 从可用单元格中选择输出值最高的一个
		let bestMove = -1
		let maxOutput = -Infinity
		for (const cellIndex of availableCells) 
			if (outputValues[cellIndex] > maxOutput) {
				maxOutput = outputValues[cellIndex]
				bestMove = cellIndex
			}
		
		return bestMove
	}


	/**
	 * 获取AI的下一步移动。
	 * @param {object} gameState - 当前游戏状态。
	 * @returns {Promise<number>} AI选择的单元格索引。
	 */
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

		return availableCells.reduce((best, current) => outputs[current] > outputs[best] ? current : best)
	}

	/**
	 * 生成神经网络的输入。
	 * @param {Array<string>} board - 棋盘数组。
	 * @param {string} currentPlayer - 当前玩家。
	 * @param {Array<object>} moveHistory - 移动历史。
	 * @param {Array<object>} activePieces - 活跃棋子。
	 * @returns {Array<number>} 神经网络的输入数组。
	 */
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
