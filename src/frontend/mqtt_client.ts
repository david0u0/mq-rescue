import { SiteInfo, ConnectState } from '../core/site_info';
import { connMQTT } from './ipc_render';

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
		} catch(err) {
			this.conn_state = ConnectState.Fail;
			throw err;
		}
	}
	async sub(topic: string, handler: MsgHandler): Promise<void> {
	}
}