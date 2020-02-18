import { ipcRenderer as ipc } from 'electron';
import { Conn, OK } from '../core/ipc_interface';

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