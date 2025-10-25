import { GameState } from '../game/game-state.mjs'

import { AI } from './base-ai.mjs'

export class TraditionalAI extends AI {
	// 提取出的辅助方法
	findWinningMove(gameState, player, availableCells) {
		for (const cellIndex of availableCells) {
			const tempState = [...gameState]
			tempState[cellIndex] = player
			if (GameState.checkWinConditionFromState(tempState))
				return cellIndex
		}
		return null // 未找到致胜步
	}

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
