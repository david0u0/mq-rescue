import * as mqtt from 'mqtt';
import * as fs from 'fs';
import { SiteInfo, ConnectState, TopicInfo } from '../core/site_info';
import { joinPrjRoot } from './load_config';

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
				clientId: `mq-savior-${Math.random().toString(36).substring(2)}`,
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
	sub(topic: TopicInfo) {
		if (this.client) {
			console.log(`subscribe ${JSON.stringify(topic)}`);
			this.client.subscribe(topic.name);
			if (!this.site.topics.find(t => t.name == topic.name)) {
				this.site.topics.push(topic);
			}
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
