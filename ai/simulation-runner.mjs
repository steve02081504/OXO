import { GameConfig } from '../config.mjs'
import { GameState } from '../game/game-state.mjs'

/**
 * 运行一局游戏模拟。
 * @param {object} aiX - X玩家的AI实例。
 * @param {object} aiO - O玩家的AI实例。
 * @param {number} [maxMoves=GameConfig.ai.training.maxMovesPerGame] - 每局游戏的最大移动次数。
 * @returns {Promise<{moves: Array<object>, winner: string|null, winCondition: object|null}>} 游戏结果。
 */
export async function runGameSimulation(aiX, aiO, maxMoves = GameConfig.ai.training.maxMovesPerGame) {
	const gameStateInstance = new GameState()
	const moves = []
	let winner = null
	let winCondition = null
	let moveCount = 0

	while (gameStateInstance.gameActive && moveCount < maxMoves) {
		const currentAI = gameStateInstance.currentPlayer === 'X' ? aiX : aiO

		const chosenMove = await currentAI.getMove(gameStateInstance)

		const stepActivations = {
			activatedNodes: currentAI.activatedNodes || [],
			activatedConnections: currentAI.activatedConnections || []
		}

		if (chosenMove !== -1 && gameStateInstance.isValidMove(chosenMove)) {
			const playerWhoMoved = gameStateInstance.currentPlayer
			const moveResult = gameStateInstance.makeMove(chosenMove)

			moves.push({
				player: playerWhoMoved,
				cellIndex: chosenMove,
				timestamp: Date.now(),
				lifetime: GameConfig.rules.maxLifetime,
				activations: stepActivations
			})
			moveCount++

			if (moveResult.type === 'win') {
				winner = moveResult.result.winner
				winCondition = moveResult.result
				break
			} else if (moveResult.type === 'draw')
				break

		} else break
	}
	return { moves, winner, winCondition }
}
