import anime from 'https://cdn.jsdelivr.net/npm/animejs/lib/anime.es.js'

import { autoEveProgress, battleCountEl, bestFitnessEl, populationSizeEl, generationCountEl, averageFitnessEl, networkComplexityNodesEl, networkComplexityConnectionsEl, avgGameLenghtEl } from './DOM.mjs'

export class StatsUpdater {
	constructor() {
		// 初始化时可以添加一些设置
	}

	updateAutoEveStats(stats) {
		const { populationSize, battleCount, bestFitness, progress, generationCount, averageFitness, networkComplexity, avgGameLength } = stats

		// Animate stat updates with subtle transitions
		const animateNumber = (element, newValue, duration = 400) => {
			if (!element) return
			const oldValue = parseFloat(element.textContent) || 0
			const difference = newValue - oldValue

			if (difference !== 0)
				anime({
					targets: element,
					opacity: [0.7, 1],
					scale: [1, 1.05, 1],
					duration,
					easing: 'easeInOutQuad',
					update(anim) {
						const progress = anim.progress / 100
						element.textContent = (oldValue + difference * progress).toFixed(element.id.includes('fitness') || element.id.includes('length') ? 2 : 0)
					},
					complete() {
						element.textContent = newValue.toFixed(element.id.includes('fitness') || element.id.includes('length') ? 2 : 0)
					}
				})
			else
				element.textContent = newValue.toFixed(element.id.includes('fitness') || element.id.includes('length') ? 2 : 0)
		}

		animateNumber(populationSizeEl, populationSize)
		animateNumber(battleCountEl, battleCount)
		animateNumber(bestFitnessEl, bestFitness)
		animateNumber(generationCountEl, generationCount)
		animateNumber(averageFitnessEl, averageFitness)
		animateNumber(networkComplexityNodesEl, networkComplexity.nodeCount)
		animateNumber(networkComplexityConnectionsEl, networkComplexity.connectionCount)
		animateNumber(avgGameLenghtEl, avgGameLength)

		// Animate progress bar
		anime({
			targets: autoEveProgress,
			width: `${progress}%`,
			duration: 300,
			easing: 'easeInOutQuad'
		})
	}
}
