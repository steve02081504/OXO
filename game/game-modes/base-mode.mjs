export class BaseMode {
	constructor() { }
	async initialize(gameManager, options) { this.gameManager = gameManager }
	async cleanup() {
	}
	async onMoveMade() {
		// 默认什么都不做，由子类实现
	}
}
