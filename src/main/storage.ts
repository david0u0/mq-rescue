import * as storage from 'electron-json-storage';

const mqKey = (mqtt_name: string) => `mqtt/${mqtt_name}`;

export function getCaches(mqtt_name: string): Promise<{ [topic: string]: string }> {
	return new Promise((resolve, reject) => {
		storage.get(mqKey(mqtt_name), (err, data) => {
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
	storage.set((mqKey(mqtt_name)), msg_map, err => {
		if (err) {
			console.log(`存訊息快取時報錯 ${err}`);
		}
	});
}

export async function getConfigCache(): Promise<string | undefined> {
	return new Promise((resolve, reject) => {
		storage.get('config', (err, data: { [key: string]: any }) => {
			if (err) {
				reject(err);
			} else {
				if (typeof data == 'object') {
					let path = data['path'];
					if (typeof path == 'string') {
						resolve(path);
					}
				}
			}
			resolve(undefined);
		});
	});

}

export async function storeConfigCache(path: string | undefined) {
	storage.set('config', { path }, err => {
		if (err) {
			console.log(`存設定檔快取時報錯 ${err}`);
		}
	});
}