import { SiteState } from '../core/site_state';
import { connMQTT } from './ipc_render';

export enum ConnectState {
	Wait,
	Idle,
	Connected,
	Fail
}

type MsgHandler = (msg: string) => void;

export class MyMQClient {
	handlers: { [topic: string]: MsgHandler[] };
	conn_state: ConnectState;
	constructor(public site: SiteState) {
		this.handlers = {};
		this.conn_state = ConnectState.Idle;
	}
	async connect(): Promise<void> {
        this.conn_state = ConnectState.Wait;
		await connMQTT(this.site.name);
	}
	async sub(topic: string, handler: MsgHandler): Promise<void> {
	}
}