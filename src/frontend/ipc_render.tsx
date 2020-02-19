import { ipcRenderer as ipc } from 'electron';
import { Conn, OK, MsgWithTopic, Sub, Msg, Pub } from '../core/ipc_interface';

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

export function onMsgMQTT(mqtt_name: string, handler: (msg_topic: MsgWithTopic) => void) {
    ipc.on(Msg(mqtt_name), (evt, msg_topic: MsgWithTopic) => {
        handler(msg_topic);
    });
}

export function subMQTT(mqtt_name: string, topic: string) {
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