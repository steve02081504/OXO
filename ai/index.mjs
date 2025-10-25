export { AI } from './base-ai.mjs'
export { TraditionalAI } from './traditional-ai.mjs'
export { NeuralAI } from './neural-ai.mjs'
export { RandomAI } from './random-ai.mjs'
export { UserInputAI } from './user-input-ai.mjs'
export { runGameSimulation } from './ai-evaluator.mjs'

import { NeuralAI } from './neural-ai.mjs'
import { RandomAI } from './random-ai.mjs'
import { TraditionalAI } from './traditional-ai.mjs'
import { UserInputAI } from './user-input-ai.mjs'

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

	static createUserInputAI(gameManager) {
		return new UserInputAI(gameManager)
	}
}
