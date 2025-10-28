import { initializeEventListeners } from './app/event-bindings.mjs'
import { PVPMode, PVEMode, EVEMode, AutoEVEMode, ReplayMode } from './game/game-modes/index.mjs'
import { GameManager } from './game/index.mjs'

document.addEventListener('DOMContentLoaded', async () => {
	const gameManager = new GameManager()

	await gameManager.initialize()

	const gameBoardElement = document.getElementById('game-board')
	gameManager.uiManager.registerView('mode-selection', document.getElementById('mode-selection'))
	gameManager.uiManager.registerView('game-view', document.getElementById('game-view'))
	gameManager.uiManager.registerView('training-view', document.getElementById('training-view'))

	gameManager.uiManager.initializeBoard(gameBoardElement, (cellIndex) => {
		gameManager.handleCellClick(cellIndex)
	})

	gameManager.modeManager.registerMode('pvp', new PVPMode())
	gameManager.modeManager.registerMode('pve', new PVEMode())
	gameManager.modeManager.registerMode('eve', new EVEMode())
	gameManager.modeManager.registerMode('auto-eve', new AutoEVEMode())
	gameManager.modeManager.registerMode('replay', new ReplayMode())

	// 将事件绑定逻辑委托出去
	initializeEventListeners(gameManager)

	// 启动后台训练
	gameManager.trainingManager.start()
	console.log('Background AI training started.')

	// 添加自动保存功能：在页面失去焦点或退出时保存训练状态
	window.addEventListener('blur', async () => {
		await gameManager.trainingManager.saveCurrentState()
	})

	window.addEventListener('beforeunload', async (event) => {
		await gameManager.trainingManager.saveCurrentState()
	})

	const urlParams = new URLSearchParams(window.location.search)
	const mode = urlParams.get('mode')
	if (mode) {
		const options = {}
		for (const [key, value] of urlParams.entries()) {
			if (options[key]) {
				if (Array.isArray(options[key]))
					options[key].push(value)
				else
					options[key] = [options[key], value]
			} else
				options[key] = value
		}
		await gameManager.startGame(mode, options)
	} else
		gameManager.uiManager.showView('mode-selection')
})
