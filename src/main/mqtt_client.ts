import * as mqtt from 'mqtt';
import * as fs from 'fs';
import { SiteInfo, ConnectState } from '../core/site_info';
import { joinPrjRoot } from './load_config';

function mqttMatchTopic(filter: string, topic: string): boolean {
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
export class MyMQClient {
	client: mqtt.MqttClient | null;
	conn_state: ConnectState;
	constructor(public site: SiteInfo) {
		this.client = null;
		this.conn_state = ConnectState.Idle;
	}
	connect(): Promise<void> {
		if (this.conn_state == ConnectState.Connected) {
			// 早已連線
			return Promise.resolve();
		}
		// 連線
		this.conn_state = ConnectState.Wait;
		return new Promise((resolve, reject) => {
			let client = this.client = mqtt.connect({
				host: this.site.addr,
				port: this.site.port,
				clientId: 'mq-savior',
				protocol: 'mqtts',
				key: fs.readFileSync(joinPrjRoot(this.site.key_path)),
				cert: fs.readFileSync(joinPrjRoot(this.site.cert_path)),
				ca: fs.readFileSync(joinPrjRoot(this.site.ca_path)),
				rejectUnauthorized: false,
				username: this.site.username,
				password: this.site.password,
			});
			// 註冊錯誤處理
			client.on('error', err => {
				this.conn_state = ConnectState.Fail;
				reject(err);
			});
			client.on('connect', () => {
				this.conn_state = ConnectState.Connected;
				resolve();
			});

		});
	}
	onMsg(handler: (topic: string, msg: Buffer) => Promise<void>) {
		if (this.client) {
			this.client.on('message', async (topic, msg) => {
				await handler(topic, msg);
			});
		}
	}
	sub(topic: string) {
		if (this.client) {
			this.client.subscribe(topic);
		} else {
			throw 'sub fail: client is null!';
		}
	}
	pub(topic: string, msg: Buffer) {
		if (this.client) {
			this.client.publish(topic, msg);
		} else {
			throw 'pub fail: client is null!';
		}
	}
	stop() {
		if (this.client) {
			this.client.end();
		}
	}
}
