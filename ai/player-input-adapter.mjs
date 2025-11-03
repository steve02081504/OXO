import confetti from 'https://esm.sh/canvas-confetti'

import { AI } from './base-ai.mjs'

export class PlayerInputAdapter extends AI {
	constructor(gameManager) {
		super()
		this.gameManager = gameManager
	}

	async getMove() {
		return this.gameManager.waitForPlayerInput()
	}

	onWin() {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 }
		})
	}
}
