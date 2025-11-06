import { BaseMode } from './base-mode.mjs'

/**
 * @class ReplayMode
 * @classdesc 回放模式，用于播放游戏记录。
 * @extends BaseMode
 */
export class ReplayMode extends BaseMode {
	/**
	 * 初始化ReplayMode。
	 * @param {object} gameManager - 游戏管理器实例。
	 * @param {object} options - 初始化选项。
	 */
	async initialize(gameManager, options) {
		await super.initialize(gameManager, options)
		this.gameManager.uiManager.hideAllControls()
		this.gameManager.uiManager.showView('game-view')
		this.gameManager.uiManager.showControlsForMode('replay')
	}

	/**
	 * 处理URL参数，加载并播放游戏记录。
	 * @param {object} options - URL参数。
	 */
	async handleUrlParams(options) {
		if (options.replayUrl) try {
			const response = await fetch(options.replayUrl)
			if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
			const history = await response.json()
			await this.gameManager.playHistory(history)
		} catch (error) {
			console.error(`Failed to load replay from ${options.replayUrl}:`, error)
		}
	}
}
