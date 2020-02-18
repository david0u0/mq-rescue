import { SiteInfo, ConnectState } from '../core/site_info';
import { connMQTT, onMsgMQTT, subMQTT } from './ipc_render';

type MsgHandler = (msg: string) => void;

export class MyMQClient {
	handlers: { [topic: string]: MsgHandler[] };
	conn_state: ConnectState;
	constructor(public site: SiteInfo) {
		this.handlers = {};
		this.conn_state = ConnectState.Idle;
	}
	async connect(): Promise<void> {
		this.conn_state = ConnectState.Wait;
		try {
			await connMQTT(this.site.name);
			this.conn_state = ConnectState.Connected;
			onMsgMQTT(this.site.name, result => {
				for (let handler of this.handlers[result.topic]) {
					handler(result.msg);
				}
			});
		} catch (err) {
			this.conn_state = ConnectState.Fail;
			throw err;
		}
	}
	async sub(topic: string, handler: MsgHandler): Promise<void> {
		if (this.conn_state == ConnectState.Connected) {
			if (typeof this.handlers[topic] == 'undefined') {
				this.handlers[topic] = [];
				subMQTT(this.site.name, topic);
			}
			this.handlers[topic].push(handler);
		} else {
			throw 'client not connected';
		}
	}
}