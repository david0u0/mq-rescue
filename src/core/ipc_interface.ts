export const OK = 'OK';
export const GG = 'GG';
export const Config = 'config'; // render: void, main: [string, SiteInfo[]]
export const Conn = 'conn'; // render: string (mqtt_name), main: "OK" / Error
export const Err = 'err'; // Error
export const SwitchPage = 'switch-page'; // number (which page)
export const SwitchTopic = 'switch-channel'; // boolean (true for up, false for down)
export const GetCache = 'get-cache'; // main: string (mq_name), render: { [topic: string]: string }
export const ToggleWriting = 'toggle-writing'; // nothing!
export const FireMessage = 'fire-message'; // nothing!
export const ConfigFile = 'config-file'; // render: string (file_url), main: OK or Error
export function Sub(mqtt_name: string) { return `sub/${mqtt_name}`; } // string (topic name)
export function Msg(mqtt_name: string) { return `msg/${mqtt_name}`; } // MsgWithTopic
export function Pub(mqtt_name: string) { return `pub/${mqtt_name}`; } // MsgWithTopic
export function SetCache(mqtt_name: string) { return `set-cache/${mqtt_name}`; } // MsgWithTopic

export type MsgWithTopic = {
    topic: string,
    msg: string,
};