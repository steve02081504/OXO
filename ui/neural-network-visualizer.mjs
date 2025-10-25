import { InputNode, OutputNode, ConstantNode } from '../neural/nodes/index.mjs'

export class NeuralNetworkVisualizer {
	constructor() {
		this.canvas = document.createElement('canvas')
		this.canvas.className = 'w-full h-auto bg-base-300 rounded-lg shadow'
		this.ctx = this.canvas.getContext('2d')
	}

	/**
	 * 返回visualizer的根DOM元素
	 * @returns {HTMLCanvasElement}
	 */
	getElement() {
		return this.canvas
	}

	resizeCanvas() {
		const container = this.canvas.parentElement
		if (container) {
			this.canvas.width = container.clientWidth
			this.canvas.height = container.clientHeight > 0 ? container.clientHeight : window.innerHeight // Default height if container has no height
		}
	}

	updateNetworkVisualization(neuralNetwork, activeNodeIds = [], activeConnections = []) {
		if (!this.canvas || !this.ctx || !neuralNetwork) return

		this.clearCanvas()

		const nodes = Array.from(neuralNetwork.nodes.values())
		const connections = neuralNetwork.getConnections()
		const nodePositions = this.calculateNodePositions(nodes)

		this.drawConnections(connections, nodePositions, activeConnections)
		this.drawNodes(nodes, nodePositions, activeNodeIds)
	}

	calculateNodePositions(nodes) {
		const positions = new Map()
		const nodeLayers = new Map()
		const layerNodes = new Map()

		nodes.forEach(node => {
			if (node instanceof InputNode) {
				nodeLayers.set(node.id, 0)
				if (!layerNodes.has(0)) layerNodes.set(0, [])
				layerNodes.get(0).push(node)
			}
		})

		// Perform a topological sort to determine layers for other nodes
		let changed = true
		let maxLayer = 0
		let iterations = 0 // 添加迭代计数器
		const MAX_ITERATIONS = nodes.length // 设置一个安全上限

		while (changed && iterations < MAX_ITERATIONS) {
			changed = false
			nodes.forEach(node => {
				if (!nodeLayers.has(node.id)) {
					// If all inputs have a determined layer, calculate this node's layer
					const inputLayers = node.inputs.map(inputId => nodeLayers.get(inputId)).filter(layer => layer !== undefined)
					if (inputLayers.length === node.inputs.length && inputLayers.length > 0) {
						const newLayer = Math.max(...inputLayers) + 1
						nodeLayers.set(node.id, newLayer)
						if (!layerNodes.has(newLayer)) layerNodes.set(newLayer, [])
						layerNodes.get(newLayer).push(node)
						maxLayer = Math.max(maxLayer, newLayer)
						changed = true
					}
				}
			})
			iterations++
		}

		if (iterations >= MAX_ITERATIONS && nodes.some(node => !nodeLayers.has(node.id)))
			console.warn('Could not determine layers for all nodes, possibly due to a cycle. Un-layered nodes will be placed arbitrarily.')

		// 为未分配层级的节点分配到一个备用层
		const fallbackLayer = maxLayer + 1
		nodes.forEach(node => {
			if (!nodeLayers.has(node.id)) {
				nodeLayers.set(node.id, fallbackLayer)
				if (!layerNodes.has(fallbackLayer)) layerNodes.set(fallbackLayer, [])
				layerNodes.get(fallbackLayer).push(node)
			}
		})

		// Assign output nodes to the rightmost layer if they haven't been assigned yet
		nodes.forEach(node => {
			if (node instanceof OutputNode && !nodeLayers.has(node.id)) {
				const newLayer = maxLayer + 1
				nodeLayers.set(node.id, newLayer)
				if (!layerNodes.has(newLayer)) layerNodes.set(newLayer, [])
				layerNodes.get(newLayer).push(node)
				maxLayer = Math.max(maxLayer, newLayer)
			}
		})

		const sortedLayers = [...layerNodes.keys()].sort((a, b) => a - b)

		// Calculate positions
		const layerMargin = 50
		const nodeMargin = 30
		const layerWidth = sortedLayers.length > 1 ? (this.canvas.width - layerMargin * 2) / (sortedLayers.length - 1) : 0

		sortedLayers.forEach((layer, layerIndex) => {
			const nodesInLayer = layerNodes.get(layer)
			const totalHeight = (nodesInLayer.length - 1) * nodeMargin
			const startY = (this.canvas.height - totalHeight) / 2

			nodesInLayer.forEach((node, nodeIndex) => {
				const x = layerMargin + layerIndex * layerWidth
				const y = startY + nodeIndex * nodeMargin
				positions.set(node.id, { x, y })
			})
		})

		return positions
	}

	drawNodes(nodes, positions, activeNodeIds) {
		nodes.forEach(node => {
			const pos = positions.get(node.id)
			if (pos) {
				this.ctx.beginPath()
				this.ctx.arc(pos.x, pos.y, 10, 0, 2 * Math.PI)
				this.ctx.fillStyle = activeNodeIds.includes(node.id) ? 'red' : this.getNodeColor(node)
				this.ctx.fill()
				this.ctx.stroke()
			}
		})
	}

	drawConnections(connections, positions, activeConnections) {
		connections.forEach(conn => {
			const fromPos = positions.get(conn.from.id)
			const toPos = positions.get(conn.to.id)

			if (fromPos && toPos) {
				this.ctx.beginPath()
				this.ctx.moveTo(fromPos.x, fromPos.y)
				this.ctx.lineTo(toPos.x, toPos.y)
				const isActive = activeConnections.some(activeConn => activeConn.from === conn.from.id && activeConn.to === conn.to.id)
				this.ctx.strokeStyle = isActive ? 'red' : `rgba(0, 0, 0, ${conn.weight})`
				this.ctx.stroke()
			}
		})
	}

	getNodeColor(node) {
		if (node instanceof InputNode) return 'lightblue'
		if (node instanceof OutputNode) return 'lightgreen'
		if (node instanceof ConstantNode) return 'yellow'
		return 'gray'
	}

	clearCanvas() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
	}

	/**
	 * 创建包含标题和canvas的完整UI组件
	 * @returns {HTMLElement}
	 */
	createCanvasWithWrapper() {
		const container = document.createElement('div')
		container.className = 'w-full max-w-xs h-96'

		container.appendChild(this.getElement())

		setTimeout(() => this.resizeCanvas(), 0)

		return container
	}
}
