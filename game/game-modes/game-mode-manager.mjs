/**
 * @class GameModeManager
 * @classdesc 管理不同的游戏模式。
 */
export class GameModeManager {
	/**
	 * 创建一个GameModeManager实例。
	 * @param {object} gameManager - 游戏管理器实例。
	 */
	constructor(gameManager) {
		this.gameManager = gameManager
		this.modes = new Map()
		this.currentMode = null
	}

	/**
	 * 注册一个新的游戏模式。
	 * @param {string} name - 游戏模式的名称。
	 * @param {object} modeHandler - 游戏模式的处理器。
	 */
	registerMode(name, modeHandler) {
		this.modes.set(name, modeHandler)
	}

	/**
	 * 切换到指定的游戏模式。
	 * @param {string} modeName - 要切换到的游戏模式的名称。
	 * @param {object} options - 传递给新模式的选项。
	 */
	async switchToMode(modeName, options = {}) {
		await this.currentMode?.cleanup?.()

		const modeHandler = this.modes.get(modeName)
		if (!modeHandler) throw new Error(`Game mode ${modeName} not found`)

		this.currentMode = modeHandler
		await this.currentMode.initialize(this.gameManager, options)
	}
}
