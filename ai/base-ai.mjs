export class AI {
	/**
	 * 可视化的AI应重写此方法并返回一个DOM元素。
	 * @returns {HTMLElement | null} 返回一个包含视图的DOM元素，或者在没有视图时返回null。
	 */
	getVisualizationUI() {
		return null
	}

	async getMove(gameState) {
		throw new Error('Method \'getMove()\' must be implemented.')
	}

	getAvailableCells(board) {
		return board.reduce((acc, cell, index) => {
			if (cell === '') acc.push(index)
			return acc
		}, [])
	}
	/**
	 * 当AI获胜时调用的方法。子类可以重写此方法来实现获胜动画或效果。
	 */
	onWin() {
		// 默认实现：什么都不做
	}

	/**
	 * 当AI输掉游戏时调用的方法。子类可以重写此方法来处理输掉的情况。
	 */
	onLose() {
		// 默认实现：什么都不做
	}
}
