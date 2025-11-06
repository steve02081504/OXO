/**
 * 将数据作为JSON文件下载。
 * @param {object} data - 要下载的数据。
 * @param {string} filename - 下载文件的名称。
 */
export function downloadJSON(data, filename) {
	const dataStr = JSON.stringify(data, null, '\t')

	const linkElement = document.createElement('a')
	linkElement.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr))
	linkElement.setAttribute('download', filename)
	linkElement.click()
}

/**
 * 统一的JSON文件导入工具函数。
 * @returns {Promise<object>} 解析后的JSON对象。
 */
export function importJSON() {
	return new Promise((resolve, reject) => {
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = '.json,application/json'

		/**
		 * @param {Event} event - 文件选择事件。
		 */
		input.onchange = (event) => {
			const file = event.target.files[0]
			if (!file) return reject(new Error('未选择文件。'))

			const reader = new FileReader()
			/**
			 * @param {ProgressEvent<FileReader>} e - 文件加载事件。
			 */
			reader.onload = (e) => {
				try {
					resolve(JSON.parse(e.target.result))
				} catch (err) {
					reject(new Error('文件解析失败，请确保为有效的JSON格式。'))
				}
			}
			reader.onerror = () => reject(new Error('文件读取失败。'))
			reader.readAsText(file)
		}
		input.click()
	})
}
