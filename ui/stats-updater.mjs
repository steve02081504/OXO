import anime from 'https://cdn.jsdelivr.net/npm/animejs/lib/anime.es.js'

import { autoEveProgress, battleCountEl, bestFitnessEl, populationSizeEl, generationCountEl, averageFitnessEl, networkComplexityNodesEl, networkComplexityConnectionsEl, avgGameLenghtEl } from './DOM.mjs'

/**
 * @class StatsUpdater
 * @classdesc 负责更新统计数据的UI显示。
 */
export class StatsUpdater {
	/**
	 * @constructor
	 */
	constructor() {
		// 初始化时可以添加一些设置
	}

	/**
	 * 更新Auto EVE模式的统计数据。
	 * @param {object} stats - 包含统计数据的对象。
	 */
	updateAutoEveStats(stats) {
		const { populationSize, battleCount, bestFitness, progress, generationCount, averageFitness, networkComplexity, avgGameLength } = stats

		// Animate stat updates with subtle transitions
		/**
		 * 动画更新数字。
		 * @param {HTMLElement} element - 要更新的DOM元素。
		 * @param {number} newValue - 新的数值。
		 * @param {number} [duration=400] - 动画持续时间。
		 */
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
					/**
					 * 动画更新时的回调。
					 * @param {object} anim - 动画实例。
					 */
					update(anim) {
						const progress = anim.progress / 100
						element.textContent = (oldValue + difference * progress).toFixed(element.id.includes('fitness') || element.id.includes('length') ? 2 : 0)
					},
					/**
					 * 动画完成时的回调。
					 */
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
