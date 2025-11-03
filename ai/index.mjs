export { AI } from './base-ai.mjs'
export { TraditionalAI } from './traditional-ai.mjs'
export { NeuralAI } from './neural-ai.mjs'
export { RandomAI } from './random-ai.mjs'
export { PlayerInputAdapter } from './player-input-adapter.mjs'
export { runGameSimulation } from './simulation-runner.mjs'

import { NeuralAI } from './neural-ai.mjs'
import { RandomAI } from './random-ai.mjs'
import { TraditionalAI } from './traditional-ai.mjs'
import { PlayerInputAdapter } from './player-input-adapter.mjs'

export class AIFactory {
	static createTraditionalAI() {
		return new TraditionalAI()
	}

	static createNeuralAI(network) {
		return new NeuralAI(network)
	}

	static createRandomAI() {
		return new RandomAI()
	}

	static createPlayerInputAdapter(gameManager) {
		return new PlayerInputAdapter(gameManager)
	}
}
