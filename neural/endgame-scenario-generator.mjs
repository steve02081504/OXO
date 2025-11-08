import { GameState } from '../game/game-state.mjs'

/**
 * @class EndgameScenarioGenerator
 * @classdesc 用于生成特定战术场景（如“一步制胜”或“必须防守”）的工具类。
 */
export class EndgameScenarioGenerator {

	/**
	 * 生成一个“下一步即可获胜”的场景。
	 * @returns {{board: string[], currentPlayer: string, correctMove: number}|null} 场景对象或null（如果生成失败）。
	 */
	generateWinInOneScenario() {
		while(true) {
			const board = Array(9).fill('')
			const players = ['X', 'O']
			let currentPlayer = players[Math.floor(Math.random() * 2)]
			const moveCount = Math.floor(Math.random() * 4) + 2 // 放置2到5个棋子

			// 1. 随机放置一些棋子，构建一个未结束的棋局
			const placedIndices = new Set()
			for (let i = 0; i < moveCount; i++) {
				let index
				do
					index = Math.floor(Math.random() * 9)
				 while (placedIndices.has(index))
				board[index] = currentPlayer
				placedIndices.add(index)
				currentPlayer = currentPlayer === 'X' ? 'O' : 'X'
			}

			// 如果当前棋局已经有胜者，则重来
			if (GameState.checkWinConditionFromState(board)) continue

			// 2. 寻找一个可以让当前玩家一步制胜的位置
			const availableCells = this.getAvailableCells(board)
			const winningMoves = []
			for (const cellIndex of availableCells) {
				const tempBoard = [...board]
				tempBoard[cellIndex] = currentPlayer
				if (GameState.checkWinConditionFromState(tempBoard))
					winningMoves.push(cellIndex)

			}

			// 3. 如果找到了唯一一个制胜点，就返回这个场景
			if (winningMoves.length > 0) {
				const correctMove = winningMoves[Math.floor(Math.random() * winningMoves.length)]
				return {
					board,
					currentPlayer,
					correctMove
				}
			}
		}
	}

	/**
	 * 生成一个“若不防守此点，对方下一步即可获胜”的场景。
	 * @returns {{board: string[], currentPlayer: string, correctMove: number}|null} 场景对象或null（如果生成失败）。
	 */
	generateMustBlockScenario() {
		while(true) {
			const board = Array(9).fill('')
			const players = ['X', 'O']
			let mover = players[Math.floor(Math.random() * 2)] // 假设的下棋方
			const moveCount = Math.floor(Math.random() * 4) + 3 // 放置3到6个棋子

			const placedIndices = new Set()
			for (let i = 0; i < moveCount; i++) {
				let index
				do
					index = Math.floor(Math.random() * 9)
				 while (placedIndices.has(index))
				board[index] = mover
				placedIndices.add(index)
				mover = mover === 'X' ? 'O' : 'X'
			}

			if (GameState.checkWinConditionFromState(board)) continue

			const opponent = mover // 对于当前棋盘，轮到`mover`下棋，所以`opponent`是上一步的下棋者
			const currentPlayer = opponent === 'X' ? 'O' : 'X' // 我们要测试的玩家是 `currentPlayer`

			// 寻找对手(opponent)的一步制胜点，这个点就是我方(currentPlayer)的“必防点”
			const availableCells = this.getAvailableCells(board)
			const opponentWinningMoves = []
			for (const cellIndex of availableCells) {
				const tempBoard = [...board]
				tempBoard[cellIndex] = currentPlayer // 注意：这里是 `currentPlayer` 即将要获胜
				if (GameState.checkWinConditionFromState(tempBoard))
					opponentWinningMoves.push(cellIndex)

			}

			// 如果找到了这样的点，就构造一个轮到 `opponent` 来防守的局面
			if (opponentWinningMoves.length > 0) {
				const correctMove = opponentWinningMoves[Math.floor(Math.random() * opponentWinningMoves.length)]
				return {
					board,
					currentPlayer: opponent, // 轮到“防守方”下棋
					correctMove // “防守方”必须下的位置
				}
			}
		}
	}

	/**
	 * 获取棋盘上的可用单元格。
	 * @param {string[]} board - 棋盘数组。
	 * @returns {number[]} 可用单元格的索引数组。
	 */
	getAvailableCells(board) {
		return board.reduce((acc, cell, index) => {
			if (cell === '') acc.push(index)
			return acc
		}, [])
	}
}
