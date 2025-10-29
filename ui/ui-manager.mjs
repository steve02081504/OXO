import { downloadJSON } from '../core/utils.mjs'

import { BoardRenderer } from './board-renderer.mjs'
import { StatsUpdater } from './stats-updater.mjs'
import { ViewController } from './view-controller.mjs'

export class UIManager {
	constructor(gameManager) {
		this.gameManager = gameManager
		this.boardRenderer = new BoardRenderer()
		this.viewController = new ViewController()
		this.statsUpdater = new StatsUpdater()
		this.fitnessChart = null
		this.winRateChart = null
	}

	registerView(name, element) {
		this.viewController.registerView(name, element)
	}

	showView(name) {
		this.viewController.showView(name)
	}

	initializeBoard(boardElement, cellClickHandler) {
		this.boardRenderer.initializeBoard(boardElement, cellClickHandler)
	}

	showExportHistoryButton() {
		this.viewController.showExportHistoryButton()
	}

	hideExportHistoryButton() {
		this.viewController.hideExportHistoryButton()
	}

	exportGameHistory(moveHistory) {
		downloadJSON(moveHistory, `oxo_history_${Date.now()}.json`)
	}

	showControlsForMode(modeName) {
		this.viewController.showControlsForMode(modeName)
	}

	hideAllControls() {
		this.viewController.hideAllControls()
	}

	displayVisualizationForPlayer(player, uiElement) {
		this.viewController.displayVisualizationForPlayer(player, uiElement)
	}

	clearAllVisualizations() {
		this.viewController.clearAllVisualizations()
	}

	updateBoard(gameStateArray, moveHistory) {
		this.updateMoveCountDisplay(moveHistory.length)
		this.boardRenderer.updateBoard(gameStateArray, moveHistory)
	}

	updateCell(cellIndex, playerSymbol, moveHistory) {
		this.boardRenderer.updateCell(cellIndex, playerSymbol, moveHistory)
	}

	updatePieceOpacity(element, cellIndex, player, moveHistory) {
		this.boardRenderer.updatePieceOpacity(element, cellIndex, player, moveHistory)
	}

	drawWinningLine(winResult) {
		return this.boardRenderer.drawWinningLine(winResult)
	}

	updateTurnIndicator(currentPlayer) {
		this.viewController.updateTurnIndicator(currentPlayer)
	}

	showEndgameActions() {
		this.viewController.showEndgameActions()
	}

	hideEndgameActions() {
		this.viewController.hideEndgameActions()
	}

	showAutoEveControls() {
		this.viewController.showAutoEveControls()
	}

	hideAutoEveControls() {
		this.viewController.hideAutoEveControls()
	}

	showPveControls() {
		this.viewController.showPveControls()
	}

	hidePveControls() {
		this.viewController.hidePveControls()
	}

	showPvpControls() {
		this.viewController.showPvpControls()
	}

	hidePvpControls() {
		this.viewController.hidePvpControls()
	}

	showReplayControls() {
		this.viewController.showReplayControls()
	}

	hideReplayControls() {
		this.viewController.hideReplayControls()
	}

	setBoardInteraction(enabled) {
		this.boardRenderer.setBoardInteraction(enabled)
	}

	resetBoardAndWinningLine() {
		this.boardRenderer.resetBoardAndWinningLine()
		this.viewController.hideEndgameActions()
	}

	updateAutoEveStats(stats) {
		this.statsUpdater.updateAutoEveStats(stats)
	}

	showExitGameButton() {
		this.viewController.showExitGameButton()
	}

	hideExitGameButton() {
		this.viewController.hideExitGameButton()
	}

	showExitGameButtonPVE() {
		this.viewController.showExitGameButtonPVE()
	}

	hideExitGameButtonPVE() {
		this.viewController.hideExitGameButtonPVE()
	}

	indicateThinking(isThinking, player) {
		this.viewController.indicateThinking(isThinking, player)
	}

	reset() {
		this.resetBoardAndWinningLine()
		this.updateMoveCountDisplay(0)
		this.viewController.hideExportHistoryButton()
		if (this.fitnessChart) {
			this.fitnessChart.data.labels = []
			this.fitnessChart.data.datasets[0].data = []
			this.fitnessChart.data.datasets[1].data = []
			this.fitnessChart.update()
		}
		if (this.winRateChart) {
			this.winRateChart.data.labels = []
			this.winRateChart.data.datasets[0].data = []
			this.winRateChart.data.datasets[1].data = []
			this.winRateChart.update()
		}
	}

	updateMoveCountDisplay(count) {
		const displayElement = document.getElementById('move-count-display')
		if (displayElement)
			displayElement.textContent = count
	}

	showConfirmResetModal() {
		this.viewController.showConfirmResetModal()
	}
}
