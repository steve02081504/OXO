import { GameState } from '../game/game-state.mjs'

import { AI } from './base-ai.mjs'

/**
 * @class TraditionalAI
 * @classdesc 一个传统的基于规则的AI。
 * @extends AI
 */
export class TraditionalAI extends AI {
	/**
	 * 查找致胜的移动。
	 * @param {Array<string>} gameState - 游戏状态数组。
	 * @param {string} player - 玩家。
	 * @param {Array<number>} availableCells - 可用单元格。
	 * @returns {number|null} 如果找到致胜移动，则返回单元格索引，否则返回null。
	 */
	findWinningMove(gameState, player, availableCells) {
		for (const cellIndex of availableCells) {
			const tempState = [...gameState]
			tempState[cellIndex] = player
			if (GameState.checkWinConditionFromState(tempState))
				return cellIndex
		}
		return null // 未找到致胜步
	}

	/**
	 * 获取AI的下一步移动。
	 * @param {object} gameState - 当前游戏状态。
	 * @returns {Promise<number>} AI选择的单元格索引。
	 */
	async getMove(gameState) {
		const { board, currentPlayer } = gameState
		const availableCells = this.getAvailableCells(board)

		const myWinningMove = this.findWinningMove(board, currentPlayer, availableCells)
		if (myWinningMove !== null)
			return myWinningMove

		const opponentPlayer = currentPlayer === 'X' ? 'O' : 'X'
		const opponentWinningMove = this.findWinningMove(board, opponentPlayer, availableCells)
		if (opponentWinningMove !== null)
			return opponentWinningMove

		return availableCells[Math.floor(Math.random() * availableCells.length)]
	}
}
