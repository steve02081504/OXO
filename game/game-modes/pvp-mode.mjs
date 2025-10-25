import { AIFactory } from '../../ai/index.mjs'

import { BaseMode } from './base-mode.mjs'

export class PVPMode extends BaseMode {
	async initialize(gameManager, options) {
		await super.initialize(gameManager, options)
		this.gameManager.uiManager.hideAllControls()
		this.gameManager.uiManager.showView('game-view')
		this.gameManager.uiManager.showPvpControls()
		this.playerAIs = {
			X: AIFactory.createUserInputAI(gameManager),
			O: AIFactory.createUserInputAI(gameManager)
		}
	}
	async onMoveMade() {
		const gameState = this.gameManager.gameState
		if (!gameState.gameActive) return
		const currentPlayerAI = this.playerAIs[gameState.currentPlayer]
		const move = await currentPlayerAI.getMove(gameState)
		if (move !== null && move !== -1)
			await this.gameManager.makeMove(move)
	}
}
