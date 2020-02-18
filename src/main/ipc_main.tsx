import { ipcMain as ipc } from 'electron';
import { Conn, OK } from '../core/ipc_interface';

export function onConnMQTT(handler: (mqtt_name: string) => Promise<void>): void {
    ipc.on(Conn, async (evt: any, msg: string) => {
        try {
            await handler(msg);
            evt.sender.send(Conn, OK);
        } catch(err) {
            evt.sender.send(Conn, err);
        }
    });
}