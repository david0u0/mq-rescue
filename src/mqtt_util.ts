import * as mqtt from 'mqtt';
import { SiteState } from './site_state';

type MsgHandler = (msg: string) => void;

export class MyMQClient {
	handlers: { [topic: string]: MsgHandler[] };
	client: mqtt.MqttClient | null;
	constructor(private site: SiteState) {
		this.handlers = {};
		this.client = null;
	}
	async connect(): Promise<void> {
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
					resolve();
				});
			} else {
				reject('client is null');
			}
		});
	}
	sub(topic: string, handler: MsgHandler): void {
		if (this.client) {
			if (typeof this.handlers[topic] == 'undefined') {
				this.handlers[topic] = [];
				this.client.subscribe(topic);
			}
			this.handlers[topic].push(handler);
		} else {
			throw 'client is null';
		}
	}
}