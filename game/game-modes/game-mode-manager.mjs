export class GameModeManager {
	constructor(gameManager) {
		this.gameManager = gameManager
		this.modes = new Map()
		this.currentMode = null
	}

	registerMode(name, modeHandler) {
		this.modes.set(name, modeHandler)
	}

	async switchToMode(modeName, options = {}) {
		await this.currentMode?.cleanup?.()

		const modeHandler = this.modes.get(modeName)
		if (!modeHandler) throw new Error(`Game mode ${modeName} not found`)

		this.currentMode = modeHandler
		await this.currentMode.initialize(this.gameManager, options)
	}
}
