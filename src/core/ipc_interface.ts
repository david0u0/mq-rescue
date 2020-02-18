export const OK = 'OK';
export const GG = 'GG';
export const Conn = 'conn';
export function Sub(mqtt_name: string) { return `sub/${mqtt_name}`; }
export function OnMsg(mqtt_name: string) { return `onmsg/${mqtt_name}`; }

export type MsgResult = {
    topic: string,
    msg: string,
}