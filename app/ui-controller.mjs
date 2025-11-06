import { AIFactory } from '../ai/index.mjs'
import { downloadJSON, importJSON } from '../core/index.mjs'
import { PVEMode, EVEMode, AutoEVEMode } from '../game/game-modes/index.mjs'
import { NeuralNetwork } from '../neural/neural-network.mjs'
import {
	pveSideModal, replayModal, restartAutoEveButton, confirmResetModal,
	cancelResetButton, exportHistoryButton, pvpButton, pveButton,
	pvePlayAsX, pvePlayAsO, eveButton, autoEveButton, replayButton,
	replayLastGameModalButton, uploadReplayModalButton, restartButton,
	toggleAnimationButton, nextGameButton, exitAutoEveButton
} from '../ui/DOM.mjs'

// 辅助函数：为Modal启用点击框外关闭功能
/**
 * 为Modal启用点击框外关闭功能。
 * @param {HTMLDialogElement} modalElement - 模态对话框元素。
 */
function enableModalClickOutsideClose(modalElement) {
	modalElement.addEventListener('click', (event) => {
		if (event.target === modalElement)
			modalElement.close()
	})
}

/**
 * 初始化所有UI事件监听器。
 * @param {object} gameManager - 游戏管理器实例。
 */
export function initializeEventListeners(gameManager) {
	pvpButton.addEventListener('click', () => {
		gameManager.startGame('pvp')
	})

	pveButton.addEventListener('click', () => {
		pveSideModal.showModal()
	})

	pvePlayAsX.addEventListener('click', () => {
		pveSideModal.close()
		gameManager.startGame('pve', { playerSide: 'X' })
	})

	pvePlayAsO.addEventListener('click', () => {
		pveSideModal.close()
		gameManager.startGame('pve', { playerSide: 'O' })
	})
	enableModalClickOutsideClose(pveSideModal)

	eveButton.addEventListener('click', () => {
		gameManager.startGame('eve')
	})

	autoEveButton.addEventListener('click', () => {
		gameManager.startGame('auto-eve')
	})

	replayButton.addEventListener('click', () => {
		if (gameManager.lastGameHistory.length) replayModal.showModal()
		else document.getElementById('upload-replay-modal-button').click()
	})

	replayLastGameModalButton.addEventListener('click', () => {
		replayModal.close()
		gameManager.uiManager.showView('game-view')
		gameManager.uiManager.hideEndgameActions()
		gameManager.playHistory(gameManager.lastGameHistory)
		gameManager.uiManager.showEndgameActions()
	})

	uploadReplayModalButton.addEventListener('click', async () => {
		replayModal.close()
		try {
			const moveHistory = await importJSON() // 使用统一的工具函数
			if (!Array.isArray(moveHistory) || moveHistory.length === 0)
				throw new Error('Invalid or empty history file.')

			gameManager.uiManager.showView('game-view')
			gameManager.uiManager.hideAllControls()
			await gameManager.playHistory(moveHistory)
			gameManager.uiManager.showEndgameActions()
		} catch (error) {
			alert(`Replay failed: ${error.message}`)
		}
	})
	enableModalClickOutsideClose(replayModal)

	restartButton.addEventListener('click', () => {
		gameManager.restartCurrentGame()
	})

	document.querySelectorAll('.js-exit-game').forEach(button => {
		button.addEventListener('click', () => {
			gameManager.resetToModeSelection()
		})
	})

	// 使用更简洁的配置数组和统一的逻辑
	const importExportConfigs = [
		// EVE
		{
			id: 'import-x-button', mode: EVEMode, type: 'import',
			/**
			 * @param {object} mode - 游戏模式实例。
			 * @param {object} ai - 要设置的AI实例。
			 */
			handler: (mode, ai) => { mode.playerAIs.X = ai }, message: '成功导入X玩家的神经网络！'
		},
		{
			id: 'export-x-button', mode: EVEMode, type: 'export',
			/**
			 * @param {object} mode - 游戏模式实例。
			 * @returns {object} - 要导出的神经网络实例。
			 */
			handler: (mode) => mode.playerAIs.X?.network, filename: 'neural_network_X.json'
		},
		{
			id: 'import-o-button', mode: EVEMode, type: 'import',
			/**
			 * @param {object} mode - 游戏模式实例。
			 * @param {object} ai - 要设置的AI实例。
			 */
			handler: (mode, ai) => { mode.playerAIs.O = ai }, message: '成功导入O玩家的神经网络！'
		},
		{
			id: 'export-o-button', mode: EVEMode, type: 'export',
			/**
			 * @param {object} mode - 游戏模式实例。
			 * @returns {object} - 要导出的神经网络实例。
			 */
			handler: (mode) => mode.playerAIs.O?.network, filename: 'neural_network_O.json'
		},
		// PVE
		{
			id: 'import-pve-ai-button', mode: PVEMode, type: 'import',
			/**
			 * @param {object} mode - 游戏模式实例。
			 * @param {object} ai - 要设置的AI实例。
			 */
			handler: (mode, ai) => { mode.playerAIs.O = ai }, message: '成功导入PVE AI的神经网络！'
		},
		// Auto-EVE
		{
			id: 'export-best-button', mode: AutoEVEMode, type: 'export',
			/**
			 * @param {object} mode - 游戏模式实例。
			 * @returns {object} - 要导出的神经网络实例。
			 */
			handler: (mode) => mode.exportBestNetwork(), filename: 'best_neural_network.json'
		},
		{
			id: 'import-network-button', mode: AutoEVEMode, type: 'import',
			/**
			 * @param {object} mode - 游戏模式实例。
			 * @param {object} ai - 要设置的AI实例。
			 */
			handler: (mode, ai) => { mode.importNetwork(ai.network) }, message: '成功导入神经网络并加入训练种群！'
		}
	]

	importExportConfigs.forEach(config => {
		const button = document.getElementById(config.id)
		if (!button) return

		button.addEventListener('click', async () => {
			if (!(gameManager.modeManager.currentMode instanceof config.mode))
				return alert('当前模式不支持此操作。')

			try {
				if (config.type === 'import') {
					const networkData = await importJSON() // 使用统一的工具函数
					const network = NeuralNetwork.fromJSON(networkData)
					const neuralAI = AIFactory.createNeuralAI(network)
					config.handler(gameManager.modeManager.currentMode, neuralAI)
					alert(config.message)
				} else if (config.type === 'export') {
					const network = config.handler(gameManager.modeManager.currentMode)
					if (network)
						downloadJSON(network.toJSON(), config.filename)
					else
						alert('未找到可导出的神经网络。')
				}
			} catch (error) {
				alert(`${config.type === 'import' ? '导入' : '导出'}失败: ${error.message}`)
			}
		})
	})

	toggleAnimationButton.addEventListener('click', () => {
		gameManager.modeManager.currentMode?.toggleAnimation?.()
	})

	nextGameButton.addEventListener('click', () => {
		gameManager.modeManager.currentMode?.playNextGame?.()
	})

	exitAutoEveButton.addEventListener('click', () => {
		gameManager.resetToModeSelection()
	})

	restartAutoEveButton.addEventListener('click', () => {
		gameManager.uiManager.showConfirmResetModal()
	})

	cancelResetButton.addEventListener('click', () => {
		confirmResetModal.close()
	})

	exportHistoryButton.addEventListener('click', () => {
		gameManager.uiManager.exportGameHistory(gameManager.gameState.moveHistory)
	})
}
