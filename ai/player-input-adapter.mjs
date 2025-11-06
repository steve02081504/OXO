import confetti from 'https://esm.sh/canvas-confetti'

import { AI } from './base-ai.mjs'

/**
 * @class PlayerInputAdapter
 * @classdesc 适配器，将玩家输入转换为AI接口。
 * @extends AI
 */
export class PlayerInputAdapter extends AI {
	/**
	 * @constructor
	 * @param {object} gameManager - 游戏管理器实例。
	 */
	constructor(gameManager) {
		super()
		this.gameManager = gameManager
	}

	/**
	 * 等待玩家输入作为移动。
	 * @returns {Promise<number>} 玩家选择的单元格索引。
	 */
	async getMove() {
		return this.gameManager.waitForPlayerInput()
	}

	/**
	 * 玩家获胜时显示庆祝效果。
	 */
	onWin() {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 }
		})
	}
}
