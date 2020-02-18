import { ipcMain as ipc } from 'electron';
import { Conn, OK, MsgWithTopic, Sub, Msg, Pub } from '../core/ipc_interface';

export function onConnMQTT(handler: (sender: any, mqtt_name: string) => Promise<void>): void {
    ipc.on(Conn, async (evt: any, msg: string) => {
        let sender = evt.sender;
        try {
            await handler(sender, msg);
            evt.sender.send(Conn, OK);
        } catch(err) {
            evt.sender.send(Conn, err);
        }
    });
}

export function onSubMQTT(mqtt_name: string, handler: (topic: string) => void): void {
    ipc.on(Sub(mqtt_name), async (evt: any, msg: string) => {
        handler(msg);
    });
}

export function sendMsg(sender: any, mqtt_name: string, msg_topic: MsgWithTopic) {
    sender.send(Msg(mqtt_name), msg_topic);
}

export function onPubMQTT(mqtt_name: string, handler: (msg_topic: MsgWithTopic) => void) {
    ipc.on(Pub(mqtt_name), async (evt: any, msg_topic: MsgWithTopic) => {
        handler(msg_topic);
    });
}