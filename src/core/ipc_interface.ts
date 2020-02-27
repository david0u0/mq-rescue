export const OK = 'OK';
export const GG = 'GG';
export const Conn = 'conn'; // string (mqtt_name)
export const Err = 'err'; // Error
export const SwitchPage = 'switch-page'; // number (which page)
export const SwitchTopic = 'switch-channel'; // boolean (true for up, false for down)
export function Sub(mqtt_name: string) { return `sub/${mqtt_name}`; } // string (topic name)
export function Msg(mqtt_name: string) { return `msg/${mqtt_name}`; } // MsgWithTopic
export function Pub(mqtt_name: string) { return `pub/${mqtt_name}`; } // MsgWithTopic

export type MsgWithTopic = {
    topic: string,
    msg: string,
}