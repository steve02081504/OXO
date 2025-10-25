import { GameConfig } from '../config.mjs'
import { loadPopulation } from '../core/persistence-manager.mjs'

import { NetworkEvolver } from './network-evolver.mjs'
import { NeuralNetwork } from './neural-network.mjs'

export class GeneticAlgorithm {
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

	constructor(populationSize = 10) {
		this.populationSize = populationSize
		this.population = []
	}

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

	scaleFitness(scaleFactor) {
		this.population.forEach(network => network.fitness *= scaleFactor)
	}

	resetPopulation() {
		this.population = this.createInitialPopulation()
		this.population.forEach(network => network.fitness = 0)
	}

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
