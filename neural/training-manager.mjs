import { runGameSimulation } from '../ai/simulation-runner.mjs'
import { NeuralAI } from '../ai/neural-ai.mjs'
import { TraditionalAI } from '../ai/traditional-ai.mjs'
import { GameConfig } from '../config.mjs'
import { savePopulation } from '../core/storage.mjs'

export class TrainingManager {
	constructor(geneticAlgorithm, evolutionData = null) {
		this.geneticAlgorithm = geneticAlgorithm
		this.trainingRunning = false
		this.isFullSpeed = false

		// 复用AI实例以优化性能
		this.aiPlayerX = new NeuralAI()
		this.aiPlayerO = new NeuralAI()
		this.traditionalAI = new TraditionalAI()

		// 训练状态
		this.battleCount = evolutionData?.battleCount || 0
		this.bestFitness = evolutionData?.bestFitness || 0
		this.startTime = evolutionData?.startTime || null
		this.generationCount = evolutionData?.generationCount || 0

		// 历史数据用于图表
		this.fitnessHistory = evolutionData?.fitnessHistory || []
		this.winRateHistory = evolutionData?.winRateHistory || []
		this.averageFitnessHistory = evolutionData?.averageFitnessHistory || []
		this.generationWinRates = []
		this.playerXWinRateHistory = evolutionData?.playerXWinRateHistory || []
		this.playerOWinRateHistory = evolutionData?.playerOWinRateHistory || []
		this.currentGenerationXWins = evolutionData?.currentGenerationXWins || 0
		this.currentGenerationOWins = evolutionData?.currentGenerationOWins || 0
		this.currentGenerationDraws = evolutionData?.currentGenerationDraws || 0

		this.onGenerationEvolve = null // 回调函数，每次进化时调用

		this.latestCompletedGame = null // 用于UI回放
		this.lastPlayedNetworkX = null
		this.lastPlayedNetworkO = null
		this.lastPlayedActivatedNodes = []
		this.lastPlayedActivatedConnections = []
		this.avgGameLength = evolutionData?.avgGameLength || 0
	}

	/**
	 * 启动或调整训练循环。
	 * @param {boolean} fullSpeed - true为全速训练, false为背景训练模式。
	 */
	start() {
		if (!this.trainingRunning) {
			this.trainingRunning = true
			this.trainingLoop()
		}
	}

	stop() {
		this.trainingRunning = false
	}

	setFullSpeed(fullSpeed) {
		this.isFullSpeed = fullSpeed
	}

	setOnGenerationEvolve(callback) {
		this.onGenerationEvolve = callback
	}

	/**
	 * 手动保存当前训练状态到IndexedDB
	 */
	async saveCurrentState() {
		const evolutionData = {
			generationCount: this.generationCount,
			battleCount: this.battleCount,
			bestFitness: this.bestFitness,
			startTime: this.startTime,
			fitnessHistory: this.fitnessHistory,
			winRateHistory: this.winRateHistory,
			averageFitnessHistory: this.averageFitnessHistory,
			playerXWinRateHistory: this.playerXWinRateHistory,
			playerOWinRateHistory: this.playerOWinRateHistory,
			currentGenerationXWins: this.currentGenerationXWins,
			currentGenerationOWins: this.currentGenerationOWins,
			currentGenerationDraws: this.currentGenerationDraws,
			avgGameLength: this.avgGameLength
		}
		await savePopulation({
			population: this.geneticAlgorithm.population,
			evolutionData
		})
		console.log('Training state saved manually.')
	}

	resetTraining() {
		this.stop()
		this.geneticAlgorithm.resetPopulation()
		this.battleCount = 0
		this.bestFitness = 0
		this.generationCount = 0
		this.startTime = Date.now()
		this.fitnessHistory = []
		this.winRateHistory = []
		this.averageFitnessHistory = []
		this.generationWinRates = []
		this.latestCompletedGame = null
		this.lastPlayedNetworkX = null
		this.lastPlayedNetworkO = null
		this.lastPlayedActivatedNodes = []
		this.lastPlayedActivatedConnections = []
		this.avgGameLength = 0
		this.start()
	}

	getStats() {
		const averageFitness = this.geneticAlgorithm.population.length > 0
			? this.geneticAlgorithm.population.reduce((sum, network) => sum + (network.fitness || 0), 0) / this.geneticAlgorithm.population.length
			: 0

		const generationTime = this.startTime ? (Date.now() - this.startTime) / 1000 : 0

		// 计算网络复杂度
		const bestNetwork = this.geneticAlgorithm.population.reduce((prev, current) => prev.fitness > current.fitness ? prev : current)
		const networkComplexity = bestNetwork ? {
			nodeCount: bestNetwork.nodes.size,
			connectionCount: bestNetwork.getConnections().length
		} : { nodeCount: 0, connectionCount: 0 }

		// 计算平均对局长度
		this.avgGameLength = (this.avgGameLength * 49 + (this.latestCompletedGame?.length || 0)) / 50

		return {
			populationSize: this.geneticAlgorithm.population.length,
			battleCount: this.battleCount,
			bestFitness: this.bestFitness,
			averageFitness,
			generationCount: this.generationCount,
			generationTime,
			networkComplexity,
			avgGameLength: this.avgGameLength,
			fitnessHistory: this.fitnessHistory,
			winRateHistory: this.winRateHistory,
			averageFitnessHistory: this.averageFitnessHistory,
			playerXWinRateHistory: this.playerXWinRateHistory,
			playerOWinRateHistory: this.playerOWinRateHistory,
			lastPlayedNetworkX: this.lastPlayedNetworkX,
			lastPlayedNetworkO: this.lastPlayedNetworkO,
			lastPlayedActivatedNodes: this.lastPlayedActivatedNodes,
			lastPlayedActivatedConnections: this.lastPlayedActivatedConnections,
			lastPlayedActivatedNodes: this.lastPlayedActivatedNodes,
			lastPlayedActivatedConnections: this.lastPlayedActivatedConnections
		}
	}

	async trainingLoop() {
		while (this.trainingRunning) {
			const startTime = performance.now()

			const population = this.geneticAlgorithm.population
			const network1Index = Math.floor(Math.random() * population.length)
			let network2Index

			do network2Index = Math.floor(Math.random() * population.length)
			while (network2Index === network1Index)

			const network1 = population[network1Index]
			const network2 = population[network2Index]

			this.lastPlayedNetworkX = network1
			this.lastPlayedNetworkO = network2

			this.aiPlayerX.setNetwork(network1)
			this.aiPlayerO.setNetwork(network2)

			const gameResult = await runGameSimulation(this.aiPlayerX, this.aiPlayerO, GameConfig.ai.training.maxMovesPerGame)

			// 只记录有胜负分明的对战记录到播放队列中（平局和强制截停的不记录）
			if (gameResult.winner) this.latestCompletedGame = gameResult

			// 检查平均对局长度并执行替换逻辑
			this.avgGameLength = (this.avgGameLength * 49 + gameResult.moves.length) / 50

			const winnerNetwork = gameResult.winner === 'X' ? network1 : network2
			const loserNetwork = gameResult.winner === 'X' ? network2 : network1
			if (this.avgGameLength > GameConfig.board.size * GameConfig.rules.maxLifetime &&
				gameResult.winner &&
				winnerNetwork.fitness >= loserNetwork.fitness
			) {
				const loserIndex = population.indexOf(loserNetwork)
				population[loserIndex] = winnerNetwork.clone()
				population[loserIndex].mutate()
			}

			const movesTaken = gameResult.moves.length
			const scoreFactor = Math.max(0, 100 - movesTaken)

			if (gameResult.winner) {
				winnerNetwork.fitness += (GameConfig.ai.fitnessScore[gameResult.winner] / 100) * scoreFactor
				winnerNetwork.fitness += (Math.max(loserNetwork.fitness, 0) / 10) || 0
				this.generationWinRates.push(Number(gameResult.winner === 'X'))
				this.currentGenerationXWins++
				loserNetwork.fitness += (GameConfig.ai.fitnessScore[gameResult.winner === 'X' ? 'O' : 'X'] / 100) * movesTaken
			}
			else
				this.generationWinRates.push(0.5)
			this.currentGenerationDraws++

			this.battleCount++
			this.bestFitness = Math.max(...population.map(n => n.fitness || 0))

			if (this.battleCount % (this.geneticAlgorithm.populationSize * 5) === 0) {
				// 在与传统AI对战前，评估并奖励胜利者
				for (const network of this.geneticAlgorithm.population) {
					this.aiPlayerX.setNetwork(network)
					const gameResult = await runGameSimulation(this.aiPlayerX, this.traditionalAI, GameConfig.ai.training.maxMovesPerGame)
					if (gameResult.winner === 'X')
						network.fitness += 5
				}

				const maxFitnessCurrentGeneration = Math.max(...this.geneticAlgorithm.population.map(n => n.fitness || 0))
				this.geneticAlgorithm.evolve()
				this.geneticAlgorithm.scaleFitness(1 / maxFitnessCurrentGeneration)
				this.generationCount++

				// 记录历史数据
				this.fitnessHistory.push(this.bestFitness)
				this.averageFitnessHistory.push(this.geneticAlgorithm.population.reduce((sum, network) => sum + (network.fitness || 0), 0) / this.geneticAlgorithm.population.length)
				this.winRateHistory.push(this.generationWinRates.reduce((sum, rate) => sum + rate, 0) / this.generationWinRates.length || 0)

				// 记录X和O的胜率历史
				const totalGames = this.currentGenerationXWins + this.currentGenerationOWins + this.currentGenerationDraws
				if (totalGames > 0) {
					this.playerXWinRateHistory.push(this.currentGenerationXWins / totalGames)
					this.playerOWinRateHistory.push(this.currentGenerationOWins / totalGames)
				}

				this.generationWinRates = []
				this.currentGenerationXWins = 0
				this.currentGenerationOWins = 0
				this.currentGenerationDraws = 0

				// 限制历史数据长度
				const maxHistoryLength = 100
				if (this.fitnessHistory.length > maxHistoryLength) {
					this.fitnessHistory.shift()
					this.averageFitnessHistory.shift()
					this.winRateHistory.shift()
				}

				const evolutionData = {
					generationCount: this.generationCount,
					battleCount: this.battleCount,
					bestFitness: this.bestFitness,
					startTime: this.startTime,
					fitnessHistory: this.fitnessHistory,
					winRateHistory: this.winRateHistory,
					averageFitnessHistory: this.averageFitnessHistory,
					playerXWinRateHistory: this.playerXWinRateHistory,
					playerOWinRateHistory: this.playerOWinRateHistory,
					currentGenerationXWins: this.currentGenerationXWins,
					currentGenerationOWins: this.currentGenerationOWins,
					currentGenerationDraws: this.currentGenerationDraws,
					avgGameLength: this.avgGameLength
				}
				await savePopulation({
					population: this.geneticAlgorithm.population,
					evolutionData
				})

				// 调用回调函数更新图表
				this.onGenerationEvolve?.()
			}

			let waitTime = performance.now() - startTime
			if (!this.isFullSpeed) waitTime *= 3
			await new Promise(resolve => setTimeout(resolve, waitTime))
		}
	}
}
