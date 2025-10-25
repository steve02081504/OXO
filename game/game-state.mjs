import { GameConfig } from '../config.mjs'

export class GameState {
	constructor() {
		this.reset()
	}

	reset() {
		this.gameActive = true
		this.currentPlayer = 'X'
		this.board = Array(GameConfig.board.size).fill('')
		this.moveHistory = []
		this.activePieces = []
	}

	makeMove(cellIndex) {
		if (!this.isValidMove(cellIndex))
			return { type: 'invalid' }

		this.board[cellIndex] = this.currentPlayer
		this.recordMove(cellIndex)
		this.decrementLifetimes()

		const winResult = this.checkWinCondition()
		if (winResult) {
			this.gameActive = false
			return { type: 'win', result: winResult }
		}

		if (this.isBoardFull()) {
			this.gameActive = false
			return { type: 'draw' }
		}

		this.switchPlayer()
		return { type: 'continue' }
	}

	isValidMove(cellIndex) {
		return this.gameActive &&
			cellIndex >= 0 &&
			cellIndex < GameConfig.board.size &&
			this.board[cellIndex] === ''
	}

	recordMove(cellIndex) {
		const move = {
			player: this.currentPlayer,
			cellIndex,
			timestamp: Date.now(),
			lifetime: GameConfig.rules.maxLifetime
		}
		this.moveHistory.push(move)
		this.activePieces.push(move)
	}

	/**
	 * [核心游戏规则] 棋子寿命递减。
	 * 这是一个独特的机制：每次移动后，只有自己在场上的棋子寿命会减少。
	 * 这为游戏增加了一层额外的时间压力策略。
	 */
	decrementLifetimes() {
		this.activePieces = this.activePieces.filter(piece => {
			if (piece.player !== this.currentPlayer) return true
			piece.lifetime--
			if (piece.lifetime <= 0) {
				this.board[piece.cellIndex] = '' // 从棋盘状态中移除
				return false // 从 activePieces 数组中移除
			}
			return true // 保留此棋子
		})
	}

	isBoardFull() {
		return this.board.every(cell => cell !== '')
	}

	switchPlayer() {
		this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X'
	}

	checkWinCondition() {
		return GameState.checkWinConditionFromState(this.board)
	}

	static checkWinConditionFromState(state) {
		const winningConditions = [
			[0, 1, 2], [3, 4, 5], [6, 7, 8],
			[0, 3, 6], [1, 4, 7], [2, 5, 8],
			[0, 4, 8], [2, 4, 6]
		]

		for (let i = 0; i < winningConditions.length; i++) {
			const [a, b, c] = winningConditions[i]
			if (state[a] && state[a] === state[b] && state[a] === state[c])
				return { winner: state[a], condition: winningConditions[i], index: i }
		}
		return null
	}
	getLastMove() {
		return this.moveHistory.length > 0 ? this.moveHistory[this.moveHistory.length - 1] : null
	}
}
