import React from 'react';
import { SiteInfo, ConnectState  } from '../core/site_info';

export const SiteCtx = React.createContext({
	cur_site: 0,
	cur_state: ConnectState.Idle,
	all_site: Array<SiteInfo>(),
	cur_topics: Array<number>(),
	setCurSite: (_site: number) => {},
	setCurState: (_state: ConnectState) => {},
	setCurTopic: (_topic: number) => {}
});
