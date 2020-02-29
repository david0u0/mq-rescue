import { ipcMain as ipc, WebContents } from 'electron';
import {
	Conn, OK, MsgWithTopic, Sub, Msg, Pub,
	FireMessage, SwitchPage, SwitchTopic, GetCache, SetCache, ToggleWriting
} from '../core/ipc_interface';

export function onConnMQTT(handler: (sender: WebContents, mqtt_name: string) => Promise<void>): void {
	ipc.on(Conn, async (evt: any, mq_name: string) => {
		let sender = evt.sender;
		try {
			await handler(sender, mq_name);
			evt.sender.send(Conn, OK);
		} catch (err) {
			evt.sender.send(Conn, err);
		}
	});
}
export function onGetCaches(handler: (sender: WebContents, mqtt_name: string) => Promise<{ [topic: string]: string }>): void {
	ipc.on(GetCache, async (evt: any, mq_name: string) => {
		let sender = evt.sender;
		try {
			let msg_map = await handler(sender, mq_name);
			evt.sender.send(GetCache, msg_map);
		} catch (err) {
			evt.sender.send(GetCache, err);
		}
	});
}
export function onSetCache(mqtt_name: string, handler: (msg_topic: MsgWithTopic) => void): void {
	ipc.on(SetCache(mqtt_name), (evt: any, msg_topic: MsgWithTopic) => {
		handler(msg_topic);
	});
}

export function onSubMQTT(mqtt_name: string, handler: (topic: string) => void): void {
	ipc.on(Sub(mqtt_name), (evt: any, msg: string) => {
		handler(msg);
	});
}

export function sendMsg(sender: WebContents, mqtt_name: string, msg_topic: MsgWithTopic): void {
	sender.send(Msg(mqtt_name), msg_topic);
}

export function onPubMQTT(mqtt_name: string, handler: (msg_topic: MsgWithTopic) => Promise<void>): void {
	ipc.on(Pub(mqtt_name), async (evt: any, msg_topic: MsgWithTopic) => {
		try {
			await handler(msg_topic);
			evt.sender.send(Pub(mqtt_name), OK);
		} catch (err) {
			evt.sender.send(Pub(mqtt_name), err);
			console.log(err);
		}
	});
}

export function emitSwitchPage(sender: WebContents, page: number): void {
	sender.send(SwitchPage, page);
}
export function emitSwitchTopic(sender: WebContents, is_up: boolean): void {
	sender.send(SwitchTopic, is_up);
}
export function emitToggleWriting(sender: WebContents): void {
	sender.send(ToggleWriting);
}
export function emitFireMessage(sender: WebContents): void {
	sender.send(FireMessage);
}