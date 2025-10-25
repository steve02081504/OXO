import { AI } from './base-ai.mjs'

export class RandomAI extends AI {
	async getMove(gameState) {
		const { board } = gameState
		const availableCells = this.getAvailableCells(board)
		if (availableCells.length === 0) return -1 // No moves possible
		return availableCells[Math.floor(Math.random() * availableCells.length)]
	}
}
