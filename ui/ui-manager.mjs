import { downloadJSON } from '../core/utils.mjs'

import { BoardRenderer } from './board-renderer.mjs'
import { StatsUpdater } from './stats-updater.mjs'
import { ViewManager } from './view-manager.mjs'

export class UIManager {
	constructor(gameManager) {
		this.gameManager = gameManager
		this.boardRenderer = new BoardRenderer()
		this.viewManager = new ViewManager()
		this.statsUpdater = new StatsUpdater()
		this.fitnessChart = null
		this.winRateChart = null
	}

	registerView(name, element) {
		this.viewManager.registerView(name, element)
	}

	showView(name) {
		this.viewManager.showView(name)
	}

	initializeBoard(boardElement, cellClickHandler) {
		this.boardRenderer.initializeBoard(boardElement, cellClickHandler)
	}

	showExportHistoryButton() {
		this.viewManager.showExportHistoryButton()
	}

	hideExportHistoryButton() {
		this.viewManager.hideExportHistoryButton()
	}

	exportGameHistory(moveHistory) {
		downloadJSON(moveHistory, `oxo_history_${Date.now()}.json`)
	}

	showControlsForMode(modeName) {
		this.viewManager.showControlsForMode(modeName)
	}

	hideAllControls() {
		this.viewManager.hideAllControls()
	}

	displayVisualizationForPlayer(player, uiElement) {
		this.viewManager.displayVisualizationForPlayer(player, uiElement)
	}

	clearAllVisualizations() {
		this.viewManager.clearAllVisualizations()
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
		this.viewManager.updateTurnIndicator(currentPlayer)
	}

	showEndgameActions() {
		this.viewManager.showEndgameActions()
	}

	hideEndgameActions() {
		this.viewManager.hideEndgameActions()
	}

	showAutoEveControls() {
		this.viewManager.showAutoEveControls()
	}

	hideAutoEveControls() {
		this.viewManager.hideAutoEveControls()
	}

	showPveControls() {
		this.viewManager.showPveControls()
	}

	hidePveControls() {
		this.viewManager.hidePveControls()
	}

	showPvpControls() {
		this.viewManager.showPvpControls()
	}

	hidePvpControls() {
		this.viewManager.hidePvpControls()
	}

	showReplayControls() {
		this.viewManager.showReplayControls()
	}

	hideReplayControls() {
		this.viewManager.hideReplayControls()
	}

	setBoardInteraction(enabled) {
		this.boardRenderer.setBoardInteraction(enabled)
	}

	resetBoardAndWinningLine() {
		this.boardRenderer.resetBoardAndWinningLine()
		this.viewManager.hideEndgameActions()
	}

	updateAutoEveStats(stats) {
		this.statsUpdater.updateAutoEveStats(stats)
	}

	showExitGameButton() {
		this.viewManager.showExitGameButton()
	}

	hideExitGameButton() {
		this.viewManager.hideExitGameButton()
	}

	showExitGameButtonPVE() {
		this.viewManager.showExitGameButtonPVE()
	}

	hideExitGameButtonPVE() {
		this.viewManager.hideExitGameButtonPVE()
	}

	indicateThinking(isThinking, player) {
		this.viewManager.indicateThinking(isThinking, player)
	}

	reset() {
		this.resetBoardAndWinningLine()
		this.updateMoveCountDisplay(0)
		this.viewManager.hideExportHistoryButton()
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
		this.viewManager.showConfirmResetModal()
	}
}
