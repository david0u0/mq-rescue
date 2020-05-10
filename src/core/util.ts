export function mqttMatchTopic(filter: string, topic: string): boolean {
	const filter_array = filter.split('/')
	const topic_array = topic.split('/')

	for (let i = 0; i < filter_array.length; ++i) {
		let left = filter_array[i]
		let right = topic_array[i]
		if (left === '#') return topic_array.length >= filter_array.length - 1
		if (left !== '+' && left !== right) return false
	}

	return filter_array.length === topic_array.length
}
