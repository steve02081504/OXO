/**
 * @class BaseMode
 * @classdesc 游戏模式的基类，定义了游戏模式的通用接口和行为。
 */
export class BaseMode {
	/**
	 * @constructor
	 */
	constructor() { }

	/**
	 * 初始化游戏模式。
	 * @param {object} gameManager - 游戏管理器实例。
	 * @param {object} options - 初始化选项。
	 */
	async initialize(gameManager, options) {
		this.gameManager = gameManager
		await this.handleUrlParams(options)
	}

	/**
	 * 清理或重置游戏模式的状态。
	 */
	async cleanup() {
	}

	/**
	 * 当棋局中有棋子移动时调用。
	 */
	async onMoveMade() {
		// 默认什么都不做，由子类实现
	}

	/**
	 * 处理URL参数。
	 * @param {object} options - URL参数。
	 */
	async handleUrlParams(options) {
		// 子类可以覆盖这个方法来处理特定的URL参数
	}
}
