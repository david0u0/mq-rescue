export type TopicInfo = { name: string, proto_file: string, proto_type: string };

export type SiteInfo = {
    name: string,
    addr: string,
    topics: TopicInfo[],
    port: number,
    key_path: string,
    cert_path: string,
    ca_path: string,
    username: string,
    password: string
};

export enum ConnectState {
    Wait = '連線中…',
    Idle = '閒置',
    Connected = '已連線',
    Fail = '連線失敗'
}
