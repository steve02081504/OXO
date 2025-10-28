import { AIFactory } from '../../ai/index.mjs'
import { Network } from '../../neural/index.mjs'

export class BaseMode {
	constructor() { }
	async initialize(gameManager, options) {
		this.gameManager = gameManager
		await this.handleUrlParams(options)
	}

	async cleanup() {
	}

	async onMoveMade() {
		// 默认什么都不做，由子类实现
	}

	async handleUrlParams(options) {
		// 子类可以覆盖这个方法来处理特定的URL参数
	}
}
