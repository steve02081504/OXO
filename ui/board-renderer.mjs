import anime from 'https://cdn.jsdelivr.net/npm/animejs/lib/anime.es.js'

import { GameConfig } from '../config.mjs'

import { winningLineSVG } from './DOM.mjs'

const WINNING_LINE_COORDS = [
	{ x1: -10, y1: 20, x2: 130, y2: 20 }, { x1: -10, y1: 60, x2: 130, y2: 60 }, { x1: -10, y1: 100, x2: 130, y2: 100 },
	{ x1: 20, y1: -10, x2: 20, y2: 130 }, { x1: 60, y1: -10, x2: 60, y2: 130 }, { x1: 100, y1: -10, x2: 100, y2: 130 },
	{ x1: -10, y1: -10, x2: 130, y2: 130 }, { x1: 130, y1: -10, x2: -10, y2: 130 }
]

export class BoardRenderer {
	constructor() {
		this.cellElements = []
		this.boardElement = null
	}

	initializeBoard(boardElement, cellClickHandler) {
		this.boardElement = boardElement
		this.boardElement.innerHTML = ''
		this.cellElements = []
		for (let i = 0; i < GameConfig.board.size; i++) {
			const cell = document.createElement('div')
			cell.className = 'board-cell bg-base-300 flex justify-center items-center cursor-pointer rounded-md empty-cell'
			cell.setAttribute('data-cell-index', i)
			cell.addEventListener('click', () => cellClickHandler(i))
			this.boardElement.appendChild(cell)
			this.cellElements.push(cell)
		}
	}

	updateBoard(gameStateArray, moveHistory) {
		gameStateArray.forEach((player, index) => {
			this.updateCell(index, player, moveHistory)
		})
	}

	updateCell(cellIndex, playerSymbol, moveHistory) {
		const cell = this.cellElements[cellIndex]
		if (!cell) return

		const existingIcon = cell.querySelector('iconify-icon')
		const currentSymbol = existingIcon ? existingIcon.getAttribute('icon') === 'line-md:close' ? 'X' : 'O' : ''

		if (playerSymbol === currentSymbol) {
			const iconEl = cell.querySelector('iconify-icon')
			if (iconEl) this.updatePieceOpacity(iconEl, cellIndex, playerSymbol, moveHistory)
			return
		}

		cell.innerHTML = ''
		if (playerSymbol === '')
			cell.classList.add('empty-cell')
		else {
			const iconName = playerSymbol === 'X' ? 'line-md:close' : 'line-md:circle'
			const color = playerSymbol === 'X' ? GameConfig.players.X.color : GameConfig.players.O.color
			const iconEl = document.createElement('iconify-icon')
			iconEl.className = 'piece-icon'
			iconEl.setAttribute('icon', iconName)
			iconEl.style.color = color
			this.updatePieceOpacity(iconEl, cellIndex, playerSymbol, moveHistory)
			cell.appendChild(iconEl)
			cell.classList.remove('empty-cell')
		}
	}

	updatePieceOpacity(element, cellIndex, player, moveHistory) {
		const move = moveHistory.findLast(m => m.cellIndex === cellIndex && m.player === player)
		let opacity = 1.0
		if (move) opacity = move.lifetime / (GameConfig.rules.maxLifetime - 1) // 落子后所有棋子都会-1寿命，所以理论上的最大寿命是maxLifetime-1

		element.style.opacity = opacity
	}

	drawWinningLine(winResult) {
		if (!winResult) return

		const coords = WINNING_LINE_COORDS[winResult.index]

		const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
		path.setAttribute('id', 'winning-path')
		path.setAttribute('d', `M ${coords.x1} ${coords.y1} L ${coords.x2} ${coords.y2}`)
		winningLineSVG.appendChild(path)

		return new Promise(resolve => {
			anime({
				targets: path,
				strokeDashoffset: [anime.setDashoffset, 0],
				easing: 'easeInOutSine',
				duration: GameConfig.animation.winLineDuration,
				complete: () => {
					winResult.condition.forEach(cellIndex => {
						this.cellElements[cellIndex].classList.add('winning-cell')
					})
					resolve()
				}
			})
		})
	}

	resetBoardAndWinningLine() {
		if (this.boardElement) {
			this.cellElements.forEach(cell => {
				cell.innerHTML = ''
				cell.classList.add('empty-cell')
				cell.classList.remove('winning-cell')
				cell.style.backgroundColor = ''
			})
			winningLineSVG.innerHTML = ''
		}
	}

	setBoardInteraction(enabled) {
		if (this.boardElement)
			this.boardElement.style.pointerEvents = enabled ? 'auto' : 'none'
	}
}
