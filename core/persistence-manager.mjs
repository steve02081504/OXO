// persistence-manager.mjs
// 使用IndexedDB存储和恢复神经网络种群

const DB_NAME = 'OXO_AI_Database'
const DB_VERSION = 1
const POPULATION_STORE = 'population'

let db = null

async function openDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION)

		request.onerror = () => reject(request.error)
		request.onsuccess = () => {
			db = request.result
			resolve(db)
		}

		request.onupgradeneeded = (event) => {
			const db = event.target.result
			if (!db.objectStoreNames.contains(POPULATION_STORE))
				db.createObjectStore(POPULATION_STORE)
		}
	})
}

export async function savePopulation({ population, evolutionData }) {
	try {
		if (!db) await openDB()
		const transaction = db.transaction([POPULATION_STORE], 'readwrite')
		const store = transaction.objectStore(POPULATION_STORE)

		const serializablePopulation = population.map(net => net.toJSON())
		const data = {
			population: serializablePopulation,
			evolutionData
		}
		await new Promise((resolve, reject) => {
			const request = store.put(data, 'population')
			request.onsuccess = () => resolve()
			request.onerror = () => reject(request.error)
		})

		console.log('Population and evolution data saved to IndexedDB.')
	} catch (err) {
		console.error('Failed to save population:', err)
	}
}

export async function loadPopulation() {
	try {
		if (!db) await openDB()
		const transaction = db.transaction([POPULATION_STORE], 'readonly')
		const store = transaction.objectStore(POPULATION_STORE)

		return new Promise((resolve, reject) => {
			const request = store.get('population')
			request.onsuccess = () => {
				const data = request.result
				if (data) resolve(data)
				else resolve(null)
			}
			request.onerror = () => reject(request.error)
		})
	} catch (err) {
		console.error('Failed to load population:', err)
		return null
	}
}
