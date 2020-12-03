import { MsgWithTopic } from '../core/ipc_interface';
import { SiteInfo, ConnectState, TopicInfo } from '../core/site_info';
import { connMQTT, onMsgMQTT, subMQTT } from './ipc_render';

type MsgHandler = (msg: MsgWithTopic) => void;

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
				for (let filter of Object.keys(this.handlers)) {
					if (filter == result.topic) {
						for (let handler of this.handlers[filter]) {
							handler(result);
						}
					}
				}
			});
		} catch (err) {
			this.conn_state = ConnectState.Fail;
			throw err;
		}
	}
	async sub(topic: TopicInfo, handler: MsgHandler): Promise<void> {
		if (this.conn_state == ConnectState.Connected) {
			if (typeof this.handlers[topic.name] == 'undefined') {
				this.handlers[topic.name] = [];
				subMQTT(this.site.name, topic);
			}
			this.handlers[topic.name].push(handler);
		} else {
			throw 'client not connected';
		}
	}
}