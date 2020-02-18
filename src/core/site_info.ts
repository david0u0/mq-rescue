export type SiteInfo = {
    name: string,
    addr: string,
    topics: string[],
    port: number,
};

export enum ConnectState {
	Wait = '連線中…',
	Idle = '閒置',
	Connected = '已連線',
	Fail = '連線失敗'
}
