import { AIFactory } from '../../ai/index.mjs'

import { BaseMode } from './base-mode.mjs'

/**
 * @class PVPMode
 * @classdesc PVP模式，玩家之间对战。
 * @extends BaseMode
 */
export class PVPMode extends BaseMode {
	/**
	 * 初始化PVPMode。
	 * @param {object} gameManager - 游戏管理器实例。
	 * @param {object} options - 初始化选项。
	 */
	async initialize(gameManager, options) {
		await super.initialize(gameManager, options)
		this.gameManager.uiManager.hideAllControls()
		this.gameManager.uiManager.showView('game-view')
		this.gameManager.uiManager.showPvpControls()
		this.playerAIs = {
			X: AIFactory.createPlayerInputAdapter(gameManager),
			O: AIFactory.createPlayerInputAdapter(gameManager)
		}
	}

	/**
	 * 处理移动事件。
	 */
	async onMoveMade() {
		const {gameState} = this.gameManager
		if (!gameState.gameActive) return
		const currentPlayerAI = this.playerAIs[gameState.currentPlayer]
		const move = await currentPlayerAI.getMove(gameState)
		if (move !== null && move !== -1)
			await this.gameManager.makeMove(move)
	}
}
