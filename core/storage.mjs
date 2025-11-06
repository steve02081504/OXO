// persistence-manager.mjs
// 使用IndexedDB存储和恢复神经网络种群

const DB_NAME = 'OXO_AI_Database'
const DB_VERSION = 1
const POPULATION_STORE = 'population'

let db = null

/**
 * 打开IndexedDB数据库。
 * @returns {Promise<IDBDatabase>} 数据库实例。
 */
async function openDB() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION)

		/**
		 * 在数据库打开失败时的回调函数。
		 * @returns {void}
		 */
		request.onerror = () => reject(request.error)
		/**
		 * 在数据库打开成功时的回调函数。
		 * @returns {void}
		 */
		request.onsuccess = () => {
			db = request.result
			resolve(db)
		}

		/**
		 * 在数据库升级时的回调函数。
		 * @param {IDBVersionChangeEvent} event - 数据库升级事件。
		 * @returns {void}
		 */
		request.onupgradeneeded = (event) => {
			const db = event.target.result
			if (!db.objectStoreNames.contains(POPULATION_STORE))
				db.createObjectStore(POPULATION_STORE)
		}
	})
}

/**
 * 保存种群和进化数据。
 * @param {object} params - 参数对象。
 * @param {Array<object>} params.population - 种群数组。
 * @param {object} params.evolutionData - 进化数据。
 */
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
			/**
			 * 在数据保存成功时的回调函数。
			 * @returns {void}
			 */
			request.onsuccess = () => resolve()
			/**
			 * 在数据保存失败时的回调函数。
			 * @returns {void}
			 */
			request.onerror = () => reject(request.error)
		})

		console.log('Population and evolution data saved to IndexedDB.')
	} catch (err) {
		console.error('Failed to save population:', err)
	}
}

/**
 * 加载种群和进化数据。
 * @returns {Promise<object|null>} 包含种群和进化数据的对象，如果不存在则返回null。
 */
export async function loadPopulation() {
	try {
		if (!db) await openDB()
		const transaction = db.transaction([POPULATION_STORE], 'readonly')
		const store = transaction.objectStore(POPULATION_STORE)

		return new Promise((resolve, reject) => {
			const request = store.get('population')
			/**
			 * 在数据加载成功时的回调函数。
			 * @returns {void}
			 */
			request.onsuccess = () => {
				const data = request.result
				if (data) resolve(data)
				else resolve(null)
			}
			/**
			 * 在数据加载失败时的回调函数。
			 * @returns {void}
			 */
			request.onerror = () => reject(request.error)
		})
	} catch (err) {
		console.error('Failed to load population:', err)
		return null
	}
}
