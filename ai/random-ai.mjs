import { AI } from './base-ai.mjs'

/**
 * @class RandomAI
 * @classdesc 一个随机移动的AI。
 * @extends AI
 */
export class RandomAI extends AI {
	/**
	 * 获取一个随机的合法移动。
	 * @param {object} gameState - 当前游戏状态。
	 * @returns {Promise<number>} 一个随机选择的单元格索引。
	 */
	async getMove(gameState) {
		const { board } = gameState
		const availableCells = this.getAvailableCells(board)
		if (availableCells.length === 0) return -1 // No moves possible
		return availableCells[Math.floor(Math.random() * availableCells.length)]
	}
}
