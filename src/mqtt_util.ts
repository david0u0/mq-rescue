import * as mqtt from 'mqtt';
import { SiteState } from './site_state';

export enum ConnectState {
	Wait,
	Idle,
	Connected,
	Fail
}

type MsgHandler = (msg: string) => void;

export class MyMQClient {
	handlers: { [topic: string]: MsgHandler[] };
	client: mqtt.MqttClient | null;
	conn_state: ConnectState;
	constructor(private site: SiteState) {
		this.handlers = {};
		this.client = null;
		this.conn_state = ConnectState.Idle;
	}
	async connect(): Promise<void> {
		this.conn_state = ConnectState.Wait;
		this.client = mqtt.connect(this.site.addr, {
			port: this.site.port,
			clientId: 'mq-savior'
			// TODO: 更多設置
		});
		this.client.on('message', (topic, msg_buffer) => {
			if (typeof this.handlers[topic] == 'undefined') {
				throw `No such handler for topic ${topic} :(`;
			} else {
				let msg = msg_buffer.toString();
				for (let handler of this.handlers[topic]) {
					handler(msg);
				}
			}
		});
		return new Promise((resolve, reject) => {
			if (this.client) {
				this.client.on('connect', () => {
					this.conn_state = ConnectState.Connected;
					resolve();
				});
				this.client.on('error', () => {
					this.conn_state = ConnectState.Fail;
					reject();
				});
			} else {
				reject('client is null');
			}
		});
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