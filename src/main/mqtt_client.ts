import * as mqtt from 'mqtt';
import * as fs from 'fs';
import { SiteInfo, ConnectState } from '../core/site_info';

type MsgHandler = (msg: string) => void;

export class MyMQClient {
	handlers: { [topic: string]: MsgHandler[] };
	client: mqtt.MqttClient | null;
	conn_state: ConnectState;
	constructor(private site: SiteInfo) {
		this.handlers = {};
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

			// 註冊監聽函式
			client.on('message', (topic, msg_buffer) => {
				if (typeof this.handlers[topic] == 'undefined') {
					throw `No such handler for topic ${topic} :(`;
				} else {
					let msg = msg_buffer.toString();
					for (let handler of this.handlers[topic]) {
						handler(msg);
					}
				}
			});
		})
	}
	sub(topic: string, handler: MsgHandler): void {
		if (this.client) {
			if (this.conn_state != ConnectState.Connected) {
				if (typeof this.handlers[topic] == 'undefined') {
					this.handlers[topic] = [];
					this.client.subscribe(topic);
				}
				this.handlers[topic].push(handler);
			} else {
				throw 'client not connected';
			}
		} else {
			throw 'client is null';
		}
	}
}