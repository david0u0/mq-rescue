import React from 'react';
import { SiteState } from './site_state';
import { MyMQClient } from './mqtt_util';

export const SiteCtx = React.createContext({
	cur_site: 0,
	all_site: Array<SiteState>(),
	cur_topics: Array<number>(),
	setCurSite: (_site: number) => {},
	setCurTopic: (_topic: number) => {}
});

export const MQClientCtx = React.createContext<MyMQClient | null>(null);