import { ipcRenderer as ipc } from 'electron';
import { Conn, OK, MsgResult, Sub, OnMsg } from '../core/ipc_interface';

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

export function onMsgMQTT(mqtt_name: string, handler: (res: MsgResult) => void) {
    ipc.on(OnMsg(mqtt_name), (evt, result: MsgResult) => {
        handler(result);
    });
}

export function subMQTT(mqtt_name: string, topic: string) {
    ipc.send(Sub(mqtt_name), topic);
}