import { autoEveControlsElement, eveControlsO, eveControlsX, pveControlsElement, pvpControlsElement, replayControlsElement, endgameActionsElement, exportHistoryButton, turnXElement, turnOElement, aiVisualizationLeftElement, aiVisualizationRightElement, exitGameButtonPVE, confirmResetModal, eveControlsElement } from './DOM.mjs'

const exitGameButtons = document.querySelectorAll('.js-exit-game')
const exitPVEButtons = [exitGameButtonPVE].filter(Boolean)

/**
 * @class ViewManager
 * @classdesc 管理不同的视图和UI面板。
 */
export class ViewManager {
	/**
	 * @class
	 */
	constructor() {
		this.views = new Map()
		this.controlPanels = {
			pvp: pvpControlsElement,
			pve: pveControlsElement,
			eve: [eveControlsElement, eveControlsX, eveControlsO],
			'auto-eve': autoEveControlsElement,
			replay: replayControlsElement
		}
	}

	/**
	 * 注册视图。
	 * @param {string} name - 视图名称。
	 * @param {HTMLElement} element - 视图的DOM元素。
	 */
	registerView(name, element) {
		this.views.set(name, element)
	}

	/**
	 * 显示指定视图。
	 * @param {string} name - 视图名称。
	 */
	showView(name) {
		this.views.forEach((view, viewName) => {
			if (viewName === name) view.classList.remove('hidden')
			else view.classList.add('hidden')
		})
	}

	/**
	 * 显示指定游戏模式的控制面板。
	 * @param {string} modeName - 游戏模式名称。
	 */
	showControlsForMode(modeName) {
		for (const mode in this.controlPanels) {
			const panels = Array.isArray(this.controlPanels[mode]) ? this.controlPanels[mode] : [this.controlPanels[mode]]
			const shouldShow = mode === modeName
			panels.forEach(panel => {
				if (panel) panel.classList.toggle('hidden', !shouldShow)
			})
		}
	}

	/**
	 * 隐藏所有控制面板。
	 */
	hideAllControls() {
		this.showControlsForMode(null)
		this.hideExportHistoryButton()
		this.clearAllVisualizations()
	}

	/**
	 * 为玩家显示AI可视化。
	 * @param {string} player - 玩家 ('X' 或 'O')。
	 * @param {HTMLElement} uiElement - 可视化的UI元素。
	 */
	displayVisualizationForPlayer(player, uiElement) {
		const container = player === 'X'
			? aiVisualizationLeftElement
			: aiVisualizationRightElement

		container.innerHTML = ''

		if (uiElement) {
			container.appendChild(uiElement)
			container.classList.remove('hidden')
		}
		else
			container.classList.add('hidden')
	}

	/**
	 * 清除所有AI可视化。
	 */
	clearAllVisualizations() {
		aiVisualizationLeftElement.innerHTML = ''
		aiVisualizationRightElement.innerHTML = ''
		aiVisualizationLeftElement.classList.add('hidden')
		aiVisualizationRightElement.classList.add('hidden')
	}

	/**
	 * 显示导出历史记录按钮。
	 */
	showExportHistoryButton() {
		exportHistoryButton.classList.remove('hidden')
	}

	/**
	 * 隐藏导出历史记录按钮。
	 */
	hideExportHistoryButton() {
		exportHistoryButton.classList.add('hidden')
	}

	/**
	 * 显示游戏结束操作。
	 */
	showEndgameActions() {
		endgameActionsElement.classList.remove('opacity-0', 'pointer-events-none')
	}

	/**
	 * 隐藏游戏结束操作。
	 */
	hideEndgameActions() {
		endgameActionsElement.classList.add('opacity-0', 'pointer-events-none')
	}

	/**
	 * 更新回合指示器。
	 * @param {string} currentPlayer - 当前玩家 ('X' 或 'O')。
	 */
	updateTurnIndicator(currentPlayer) {
		turnXElement.classList.toggle('current-turn-indicator', currentPlayer === 'X')
		turnOElement.classList.toggle('current-turn-indicator', currentPlayer === 'O')
	}

	/**
	 * 显示Auto EVE模式的控制面板。
	 */
	showAutoEveControls() {
		autoEveControlsElement.classList.remove('hidden')
	}

	/**
	 * 隐藏Auto EVE模式的控制面板。
	 */
	hideAutoEveControls() {
		autoEveControlsElement.classList.add('hidden')
	}

	/**
	 * 显示PVE模式的控制面板。
	 */
	showPveControls() {
		pveControlsElement.classList.remove('hidden')
	}

	/**
	 * 隐藏PVE模式的控制面板。
	 */
	hidePveControls() {
		pveControlsElement.classList.add('hidden')
	}

	/**
	 * 显示PVP模式的控制面板。
	 */
	showPvpControls() {
		pvpControlsElement.classList.remove('hidden')
	}

	/**
	 * 隐藏PVP模式的控制面板。
	 */
	hidePvpControls() {
		pvpControlsElement.classList.remove('hidden')
	}

	/**
	 * 显示回放模式的控制面板。
	 */
	showReplayControls() {
		replayControlsElement.classList.remove('hidden')
	}

	/**
	 * 隐藏回放模式的控制面板。
	 */
	hideReplayControls() {
		replayControlsElement.classList.add('hidden')
	}

	/**
	 * 显示退出游戏按钮。
	 */
	showExitGameButton() {
		exitGameButtons.forEach(button => button?.classList.remove('hidden'))
	}

	/**
	 * 隐藏退出游戏按钮。
	 */
	hideExitGameButton() {
		exitGameButtons.forEach(button => button?.classList.add('hidden'))
	}

	/**
	 * 显示PVE模式的退出游戏按钮。
	 */
	showExitGameButtonPVE() {
		exitPVEButtons.forEach(button => button?.classList.remove('hidden'))
		if (exitGameButtonPVE) exitGameButtonPVE.classList.remove('hidden')
	}

	/**
	 * 隐藏PVE模式的退出游戏按钮。
	 */
	hideExitGameButtonPVE() {
		exitPVEButtons.forEach(button => button?.classList.add('hidden'))
		if (exitGameButtonPVE) exitGameButtonPVE.classList.add('hidden')
	}

	/**
	 * 指示AI正在思考。
	 * @param {boolean} isThinking - AI是否正在思考。
	 * @param {string} player - 玩家 ('X' 或 'O')。
	 */
	indicateThinking(isThinking, player) {
		const playerElement = player === 'X' ? turnXElement : turnOElement
		if (playerElement)
			playerElement.classList.toggle('animate-bounce', isThinking)
	}

	/**
	 * 显示确认重置模态框。
	 */
	showConfirmResetModal() {
		if (confirmResetModal) confirmResetModal.showModal()
	}
}
