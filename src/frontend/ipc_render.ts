import { ipcRenderer as ipc } from 'electron';
import {
	AskConfig, Conn, OK, SwitchPage, SwitchTopic, MsgWithTopic, Sub, Msg, Pub,
	GetCache, SetCache, ToggleWriting, FireMessage, ConfigFile
} from '../core/ipc_interface';
import { Config } from '../core/config';
import { TopicInfo } from '../core/site_info';

export function askConfig(): Promise<Config> {
	return new Promise((resolve, reject) => {
		ipc.send(AskConfig);
		ipc.once(AskConfig, (evt: any, config: Config) => {
			resolve(config);
		});
	});
}
export function setConfigFile(file_url: string): Promise<void> {
	return new Promise((resolve, reject) => {
		ipc.send(ConfigFile, file_url);
		ipc.once(ConfigFile, (evt: any, ret: any) => {
			if (ret == OK) {
				resolve();
			} else {
				reject(ret);
			}
		});
	});
}
export function connMQTT(mqtt_name: string): Promise<void> {
	return new Promise((resolve, reject) => {
		ipc.send(Conn, mqtt_name);
		ipc.once(Conn, (evt: any, msg: any) => {
			if (msg == OK) {
				resolve();
			} else {
				reject(msg);
			}
		});
	});
}
export function getCaches(mqtt_name: string): Promise<{ [topic: string]: string }> {
	return new Promise((resolve, reject) => {
		ipc.send(GetCache, mqtt_name);
		ipc.once(GetCache, (evt: any, msg_map: {[topic: string]: string}) => {
			resolve(msg_map);
		});
	});
}
export function setCache(mqtt_name: string, msg_topic: MsgWithTopic) {
	ipc.send(SetCache(mqtt_name), msg_topic);
}

export function onMsgMQTT(mqtt_name: string, handler: (msg_topic: MsgWithTopic) => void) {
	ipc.on(Msg(mqtt_name), (evt, msg_topic: MsgWithTopic) => {
		handler(msg_topic);
	});
}

export function subMQTT(mqtt_name: string, topic: TopicInfo) {
	ipc.send(Sub(mqtt_name), topic);
}

export function pubMQTT(mqtt_name: string, msg_topic: MsgWithTopic): Promise<void> {
	return new Promise((resolve, reject) => {
		ipc.send(Pub(mqtt_name), msg_topic);
		ipc.once(Pub(mqtt_name), (evt: any, msg: any) => {
			if (msg == OK) {
				resolve();
			} else {
				reject(msg);
			}
		});
	});
}

export function clearSwitchPage() {
	ipc.removeAllListeners(SwitchPage);
}
export function onSwitchPage(handler: (page: number) => void) {
	ipc.on(SwitchPage, (evt: any, page: number) => {
		handler(page);
	});
}
export function clearSwitchTopic() {
	ipc.removeAllListeners(SwitchTopic);
}
export function onSwitchTopic(handler: (is_up: boolean) => void) {
	ipc.on(SwitchTopic, (evt: any, is_up: boolean) => {
		handler(is_up);
	});
}

// TODO: 改掉這醜惡的全域變數
let toggleHandler: { [mqtt_name: string]: (() => void)} = { };
ipc.on(ToggleWriting, () => {
	for (let key of Object.keys(toggleHandler)) {
		toggleHandler[key]();
	}
});
export function onToggleWriting(mqtt_name: string, handler: () => void) {
	toggleHandler[mqtt_name] = handler;
}

// TODO: 改掉這醜惡的全域變數
let fireMsgHandler: { [topic: string]: (() => void)} = { };
ipc.on(FireMessage, () => {
	for (let key of Object.keys(fireMsgHandler)) {
		fireMsgHandler[key]();
	}
});
export function onFireMessage(topic: string, handler: () => void): void {
	fireMsgHandler[topic] = handler;
}