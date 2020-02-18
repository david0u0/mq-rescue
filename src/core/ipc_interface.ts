export const OK = 'OK';
export const GG = 'GG';
export const Conn = 'conn';
export const Err = 'err';
export function Sub(mqtt_name: string) { return `sub/${mqtt_name}`; }
export function Msg(mqtt_name: string) { return `msg/${mqtt_name}`; }
export function Pub(mqtt_name: string) { return `pub/${mqtt_name}`; }

export type MsgWithTopic = {
    topic: string,
    msg: string,
}