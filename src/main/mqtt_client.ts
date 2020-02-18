import * as mqtt from 'mqtt';
import * as fs from 'fs';
import { SiteInfo, ConnectState } from '../core/site_info';

type MsgHandler = (msg: string) => void;

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
			let client = this.client = mqtt.connect(this.site.addr, {
				port: this.site.port,
				clientId: 'mq-savior',
				protocol: 'mqtts',
				key: fs.readFileSync(this.site.key_path),
				cert: fs.readFileSync(this.site.cert_path),
				ca: fs.readFileSync(this.site.ca_path),
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
				resolve()
			});

		})
	}
	onMsg(handler: (topic: string, msg: string) => void) {
		if (this.client) {
			this.client.on('message', (topic, msg) => {
				handler(topic, msg.toString());
			});
		}
	}
	sub(topic: string) {
		if (this.client) {
			this.client.subscribe(topic);
		} else {
			throw 'client is null!';
		}
	}
	pub(topic: string, msg: string) {
		if (this.client) {
			this.client.publish(topic, msg);
		} else {
			throw 'client is null!';
		}
	}
}