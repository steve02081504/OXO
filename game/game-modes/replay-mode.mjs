import { BaseMode } from './base-mode.mjs'

export class ReplayMode extends BaseMode {
	async initialize(gameManager, options) {
		await super.initialize(gameManager, options)
		this.gameManager.uiManager.hideAllControls()
		this.gameManager.uiManager.showView('game-view')
		this.gameManager.uiManager.showControlsForMode('replay')
	}

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
