import { GameConfig } from '../config.mjs'
import { loadPopulation } from '../core/storage.mjs'

import { NetworkEvolver } from './network-evolver.mjs'
import { NeuralNetwork } from './neural-network.mjs'

/**
 * @class GeneticAlgorithm
 * @classdesc 管理遗传算法，包括种群的创建、进化和选择。
 */
export class GeneticAlgorithm {
	/**
	 * 创建一个遗传算法实例，并从存储中加载种群（如果存在）。
	 * @param {number} [populationSize=10] - 种群大小。
	 * @returns {Promise<GeneticAlgorithm>} 一个新的遗传算法实例。
	 */
	static async create(populationSize = 10) {
		const ga = new GeneticAlgorithm(populationSize)
		const savedData = await loadPopulation()
		if (savedData) {
			ga.population = savedData.population.map(jsonData => NeuralNetwork.fromJSON(jsonData))
			console.log('Loaded population from storage.')
		} else {
			ga.population = ga.createInitialPopulation()
			console.log('Created new initial population.')
		}
		return ga
	}

	/**
	 * 创建一个遗传算法实例，并加载进化数据。
	 * @param {number} [populationSize=10] - 种群大小。
	 * @returns {Promise<{ga: GeneticAlgorithm, evolutionData: object|null}>} 包含遗传算法实例和进化数据的对象。
	 */
	static async createWithEvolutionData(populationSize = 10) {
		const ga = new GeneticAlgorithm(populationSize)
		const savedData = await loadPopulation()
		if (savedData) {
			ga.population = savedData.population.map(jsonData => NeuralNetwork.fromJSON(jsonData))
			console.log('Loaded population from storage.')
		} else {
			ga.population = ga.createInitialPopulation()
			console.log('Created new initial population.')
		}
		return { ga, evolutionData: savedData ? savedData.evolutionData : null }
	}

	/**
	 * @constructor
	 * @param {number} [populationSize=10] - 种群大小。
	 */
	constructor(populationSize = 10) {
		this.populationSize = populationSize
		this.population = []
	}

	/**
	 * 创建初始种群。
	 * @returns {Array<NeuralNetwork>} - 初始种群。
	 */
	createInitialPopulation() {
		const population = []
		for (let i = 0; i < this.populationSize; i++) {
			const network = new NeuralNetwork()
			for (let j = 0; j < 5; j++)
				NetworkEvolver.addRandomNode(network)

			population.push(network)
		}
		return population
	}

	/**
	 * 进化种群。
	 */
	evolve() {
		this.population.sort((a, b) => b.fitness - a.fitness)

		const newPopulation = []

		for (let i = 0; i < this.populationSize * GameConfig.ai.elitismRate; i++)
			// 保留两个带突变的复制
			for (let j = 0; j < 2; j++) {
				const mutant = this.tournamentSelection().clone()
				mutant.mutate()
				newPopulation.push(mutant)
			}

		for (let i = 0; i < this.populationSize * GameConfig.ai.elitismRate; i++) {
			const parent1 = this.tournamentSelection()
			const parent2 = this.tournamentSelection()

			const child = parent1.crossover(parent2)
			child.fitness = (parent1.fitness + parent2.fitness) / 2
			child.mutate()
			newPopulation.push(child)
		}

		newPopulation.push(...this.population.slice(0, this.populationSize - newPopulation.length))
	}

	/**
	 * 缩放适应度。
	 * @param {number} scaleFactor - 缩放因子。
	 */
	scaleFitness(scaleFactor) {
		this.population.forEach(network => network.fitness *= scaleFactor)
	}

	/**
	 * 重置种群。
	 */
	resetPopulation() {
		this.population = this.createInitialPopulation()
		this.population.forEach(network => network.fitness = 0)
	}

	/**
	 * 锦标赛选择。
	 * @param {number} [tournamentSize=GameConfig.ai.tournamentSize] - 锦标赛大小。
	 * @returns {NeuralNetwork} 最佳个体。
	 */
	tournamentSelection(tournamentSize = GameConfig.ai.tournamentSize) {
		let best = null
		for (let i = 0; i < tournamentSize; i++) {
			const individual = this.population[Math.floor(Math.random() * this.population.length)]
			if (best === null || individual.fitness > best.fitness)
				best = individual
		}
		return best
	}
}
