import React from 'react';
import { SiteState } from './site_state';

export const SiteCtx = React.createContext({
	cur_site: 0,
	all_site: Array<SiteState>(),
	cur_topics: Array<number>(),
	setCurSite: (_site: number) => {},
	setCurTopic: (_topic: number) => {}
});
