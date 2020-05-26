import { SiteInfo, ConnectState } from '../core/site_info';
import { connMQTT, onMsgMQTT, subMQTT } from './ipc_render';

type MsgHandler = (topic: string, msg: string) => void;

export class MyMQClient {
	handlers: { [filter : string]: MsgHandler[] };
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
				const { topic, msg } = result;
				for (let filter of Object.keys(this.handlers)) {
					if (filter == topic) {
						for (let handler of this.handlers[filter]) {
							handler(topic, msg);
						}
					}
				}
			});
		} catch (err) {
			this.conn_state = ConnectState.Fail;
			throw err;
		}
	}
	async sub(filter: string, handler: MsgHandler): Promise<void> {
		if (this.conn_state == ConnectState.Connected) {
			if (typeof this.handlers[filter] == 'undefined') {
				this.handlers[filter] = [];
				subMQTT(this.site.name, filter);
			}
			this.handlers[filter].push(handler);
		} else {
			throw 'client not connected';
		}
	}
}