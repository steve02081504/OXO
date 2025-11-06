import { downloadJSON } from '../core/utils.mjs'

import { BoardRenderer } from './board-renderer.mjs'
import { StatsUpdater } from './stats-updater.mjs'
import { ViewManager } from './view-manager.mjs'

/**
 * @class UIManager
 * @classdesc 管理所有UI交互和更新。
 */
export class UIManager {
	/**
	 * @constructor
	 * @param {object} gameManager - 游戏管理器实例。
	 */
	constructor(gameManager) {
		this.gameManager = gameManager
		this.boardRenderer = new BoardRenderer()
		this.viewManager = new ViewManager()
		this.statsUpdater = new StatsUpdater()
		this.fitnessChart = null
		this.winRateChart = null
	}

	/**
	 * 注册一个新视图。
	 * @param {string} name - 视图名称。
	 * @param {HTMLElement} element - 视图的DOM元素。
	 */
	registerView(name, element) {
		this.viewManager.registerView(name, element)
	}

	/**
	 * 显示指定名称的视图。
	 * @param {string} name - 视图名称。
	 */
	showView(name) {
		this.viewManager.showView(name)
	}

	/**
	 * 初始化棋盘渲染器。
	 * @param {HTMLElement} boardElement - 棋盘的DOM元素。
	 * @param {Function} cellClickHandler - 单元格点击事件的处理函数。
	 */
	initializeBoard(boardElement, cellClickHandler) {
		this.boardRenderer.initializeBoard(boardElement, cellClickHandler)
	}

	/**
	 * 显示导出历史记录按钮。
	 */
	showExportHistoryButton() {
		this.viewManager.showExportHistoryButton()
	}

	/**
	 * 隐藏导出历史记录按钮。
	 */
	hideExportHistoryButton() {
		this.viewManager.hideExportHistoryButton()
	}

	/**
	 * 导出游戏历史记录为JSON文件。
	 * @param {Array<object>} moveHistory - 移动历史记录。
	 */
	exportGameHistory(moveHistory) {
		downloadJSON(moveHistory, `oxo_history_${Date.now()}.json`)
	}

	/**
	 * 显示特定游戏模式的控制按钮。
	 * @param {string} modeName - 游戏模式的名称。
	 */
	showControlsForMode(modeName) {
		this.viewManager.showControlsForMode(modeName)
	}

	/**
	 * 隐藏所有游戏模式的控制按钮。
	 */
	hideAllControls() {
		this.viewManager.hideAllControls()
	}

	/**
	 * 为指定玩家显示AI可视化UI。
	 * @param {string} player - 玩家 ('X' 或 'O')。
	 * @param {HTMLElement} uiElement - 可视化的UI元素。
	 */
	displayVisualizationForPlayer(player, uiElement) {
		this.viewManager.displayVisualizationForPlayer(player, uiElement)
	}

	/**
	 * 清除所有AI可视化。
	 */
	clearAllVisualizations() {
		this.viewManager.clearAllVisualizations()
	}

	/**
	 * 更新整个棋盘的显示。
	 * @param {Array<string>} gameStateArray - 游戏状态数组。
	 * @param {Array<object>} moveHistory - 移动历史记录。
	 */
	updateBoard(gameStateArray, moveHistory) {
		this.updateMoveCountDisplay(moveHistory.length)
		this.boardRenderer.updateBoard(gameStateArray, moveHistory)
	}

	/**
	 * 更新单个单元格的显示。
	 * @param {number} cellIndex - 单元格索引。
	 * @param {string} playerSymbol - 玩家符号 ('X' 或 'O')。
	 * @param {Array<object>} moveHistory - 移动历史记录。
	 */
	updateCell(cellIndex, playerSymbol, moveHistory) {
		this.boardRenderer.updateCell(cellIndex, playerSymbol, moveHistory)
	}

	/**
	 * 更新棋子的不透明度。
	 * @param {HTMLElement} element - 棋子元素。
	 * @param {number} cellIndex - 单元格索引。
	 * @param {string} player - 玩家符号。
	 * @param {Array<object>} moveHistory - 移动历史记录。
	 */
	updatePieceOpacity(element, cellIndex, player, moveHistory) {
		this.boardRenderer.updatePieceOpacity(element, cellIndex, player, moveHistory)
	}

	/**
	 * 绘制胜利线。
	 * @param {object} winResult - 胜利结果对象。
	 * @returns {Promise<void>} 动画完成的Promise。
	 */
	drawWinningLine(winResult) {
		return this.boardRenderer.drawWinningLine(winResult)
	}

	/**
	 * 更新回合指示器。
	 * @param {string} currentPlayer - 当前玩家 ('X' 或 'O')。
	 */
	updateTurnIndicator(currentPlayer) {
		this.viewManager.updateTurnIndicator(currentPlayer)
	}

	/**
	 * 显示游戏结束后的操作按钮。
	 */
	showEndgameActions() {
		this.viewManager.showEndgameActions()
	}

	/**
	 * 隐藏游戏结束后的操作按钮。
	 */
	hideEndgameActions() {
		this.viewManager.hideEndgameActions()
	}

	/**
	 * 显示Auto EVE模式的控制按钮。
	 */
	showAutoEveControls() {
		this.viewManager.showAutoEveControls()
	}

	/**
	 * 隐藏Auto EVE模式的控制按钮。
	 */
	hideAutoEveControls() {
		this.viewManager.hideAutoEveControls()
	}

	/**
	 * 显示PVE模式的控制按钮。
	 */
	showPveControls() {
		this.viewManager.showPveControls()
	}

	/**
	 * 隐藏PVE模式的控制按钮。
	 */
	hidePveControls() {
		this.viewManager.hidePveControls()
	}

	/**
	 * 显示PVP模式的控制按钮。
	 */
	showPvpControls() {
		this.viewManager.showPvpControls()
	}

	/**
	 * 隐藏PVP模式的控制按钮。
	 */
	hidePvpControls() {
		this.viewManager.hidePvpControls()
	}

	/**
	 * 显示回放模式的控制按钮。
	 */
	showReplayControls() {
		this.viewManager.showReplayControls()
	}

	/**
	 * 隐藏回放模式的控制按钮。
	 */
	hideReplayControls() {
		this.viewManager.hideReplayControls()
	}

	/**
	 * 设置棋盘的交互状态。
	 * @param {boolean} enabled - 是否启用交互。
	 */
	setBoardInteraction(enabled) {
		this.boardRenderer.setBoardInteraction(enabled)
	}

	/**
	 * 重置棋盘和胜利线。
	 */
	resetBoardAndWinningLine() {
		this.boardRenderer.resetBoardAndWinningLine()
		this.viewManager.hideEndgameActions()
	}

	/**
	 * 更新Auto EVE模式的统计数据。
	 * @param {object} stats - 统计数据对象。
	 */
	updateAutoEveStats(stats) {
		this.statsUpdater.updateAutoEveStats(stats)
	}

	/**
	 * 显示退出游戏按钮。
	 */
	showExitGameButton() {
		this.viewManager.showExitGameButton()
	}

	/**
	 * 隐藏退出游戏按钮。
	 */
	hideExitGameButton() {
		this.viewManager.hideExitGameButton()
	}

	/**
	 * 显示PVE模式的退出游戏按钮。
	 */
	showExitGameButtonPVE() {
		this.viewManager.showExitGameButtonPVE()
	}

	/**
	 * 隐藏PVE模式的退出游戏按钮。
	 */
	hideExitGameButtonPVE() {
		this.viewManager.hideExitGameButtonPVE()
	}

	/**
	 * 指示AI正在思考。
	 * @param {boolean} isThinking - AI是否正在思考。
	 * @param {string} player - 玩家 ('X' 或 'O')。
	 */
	indicateThinking(isThinking, player) {
		this.viewManager.indicateThinking(isThinking, player)
	}

	/**
	 * 重置UI到初始状态。
	 */
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

	/**
	 * 更新移动次数显示。
	 * @param {number} count - 移动次数。
	 */
	updateMoveCountDisplay(count) {
		const displayElement = document.getElementById('move-count-display')
		if (displayElement)
			displayElement.textContent = count
	}

	/**
	 * 显示确认重置模态框。
	 */
	showConfirmResetModal() {
		this.viewManager.showConfirmResetModal()
	}
}
