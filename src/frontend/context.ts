import React from 'react';
import { SiteInfo, ConnectState  } from '../core/site_info';

// TODO: 多拆幾個上下文
export const SiteCtx = React.createContext({
	cur_site: 0,
	all_site: Array<SiteInfo>(),
	cur_topics: Array<number>(),
	all_states: Array<ConnectState>(),
	setCurSite: (_site: number) => {},
	setCurState: (_state: ConnectState) => {},
	setCurTopic: (_topic: number) => {}
});
