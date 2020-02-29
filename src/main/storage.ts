import * as storage from 'electron-json-storage';

export function getCaches(mqtt_name: string): Promise<{ [topic: string]: string }> {
	return new Promise((resolve, reject) => {
		storage.get(mqtt_name, (err, data) => {
			if (err) {
				reject(err);
			} else {
				if (typeof data == 'object') {
					resolve(data as any);
				} else {
					resolve({});
				}
			}
		});
	});
}

export async function storeCache(mqtt_name: string, topic: string, msg: string) {
	let msg_map = await getCaches(mqtt_name);
	msg_map[topic] = msg;
	storage.set(mqtt_name, msg_map, err => {
		if (err) {
			console.log(`存訊息快取時報錯 ${err}`);
		}
	});
}