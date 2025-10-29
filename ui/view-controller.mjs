import { autoEveControlsElement, eveControlsO, eveControlsX, pveControlsElement, pvpControlsElement, replayControlsElement, endgameActionsElement, exportHistoryButton, turnXElement, turnOElement, aiVisualizationLeftElement, aiVisualizationRightElement, exitGameButtonPVE, confirmResetModal, eveControlsElement } from './DOM.mjs'

const exitGameButtons = document.querySelectorAll('.js-exit-game')
const exitPVEButtons = [exitGameButtonPVE].filter(Boolean)

export class ViewController {
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

	registerView(name, element) {
		this.views.set(name, element)
	}

	showView(name) {
		this.views.forEach((view, viewName) => {
			if (viewName === name) view.classList.remove('hidden')
			else view.classList.add('hidden')
		})
	}

	showControlsForMode(modeName) {
		for (const mode in this.controlPanels) {
			const panels = Array.isArray(this.controlPanels[mode]) ? this.controlPanels[mode] : [this.controlPanels[mode]]
			const shouldShow = mode === modeName
			panels.forEach(panel => {
				if (panel) panel.classList.toggle('hidden', !shouldShow)
			})
		}
	}

	hideAllControls() {
		this.showControlsForMode(null)
		this.hideExportHistoryButton()
		this.clearAllVisualizations()
	}

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

	clearAllVisualizations() {
		aiVisualizationLeftElement.innerHTML = ''
		aiVisualizationRightElement.innerHTML = ''
		aiVisualizationLeftElement.classList.add('hidden')
		aiVisualizationRightElement.classList.add('hidden')
	}

	showExportHistoryButton() {
		exportHistoryButton.classList.remove('hidden')
	}

	hideExportHistoryButton() {
		exportHistoryButton.classList.add('hidden')
	}

	showEndgameActions() {
		endgameActionsElement.classList.remove('opacity-0', 'pointer-events-none')
	}

	hideEndgameActions() {
		endgameActionsElement.classList.add('opacity-0', 'pointer-events-none')
	}

	updateTurnIndicator(currentPlayer) {
		turnXElement.classList.toggle('current-turn-indicator', currentPlayer === 'X')
		turnOElement.classList.toggle('current-turn-indicator', currentPlayer === 'O')
	}

	showAutoEveControls() {
		autoEveControlsElement.classList.remove('hidden')
	}

	hideAutoEveControls() {
		autoEveControlsElement.classList.add('hidden')
	}

	showPveControls() {
		pveControlsElement.classList.remove('hidden')
	}

	hidePveControls() {
		pveControlsElement.classList.add('hidden')
	}

	showPvpControls() {
		pvpControlsElement.classList.remove('hidden')
	}

	hidePvpControls() {
		pvpControlsElement.classList.remove('hidden')
	}

	showReplayControls() {
		replayControlsElement.classList.remove('hidden')
	}

	hideReplayControls() {
		replayControlsElement.classList.add('hidden')
	}

	showExitGameButton() {
		exitGameButtons.forEach(button => button?.classList.remove('hidden'))
	}

	hideExitGameButton() {
		exitGameButtons.forEach(button => button?.classList.add('hidden'))
	}

	showExitGameButtonPVE() {
		exitPVEButtons.forEach(button => button?.classList.remove('hidden'))
		if (exitGameButtonPVE) exitGameButtonPVE.classList.remove('hidden')
	}

	hideExitGameButtonPVE() {
		exitPVEButtons.forEach(button => button?.classList.add('hidden'))
		if (exitGameButtonPVE) exitGameButtonPVE.classList.add('hidden')
	}

	indicateThinking(isThinking, player) {
		const playerElement = player === 'X' ? turnXElement : turnOElement
		if (playerElement)
			playerElement.classList.toggle('animate-bounce', isThinking)
	}

	showConfirmResetModal() {
		if (confirmResetModal) confirmResetModal.showModal()
	}
}
