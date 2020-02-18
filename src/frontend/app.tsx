import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { MQHeader } from './mq_header';
import { SiteState } from '../core/site_state';
import { SiteCtx, MQClientCtx } from './context';
import { TopicBar } from './topic_bar';
import { MessageBody } from './message_body';

let sites: SiteState[] = [
	{
		name: 'mq1',
		status: true,
		addr: 'localhost',
		topics: ['hello', 'mq'],
		port: 8887
	},
	{
		name: 'mq2 with a fuckin long name',
		status: false,
		addr: 'localhost',
		topics: ['this', 'is'],
		port: 8887
	},
	{
		name: 'mq3',
		status: true,
		addr: 'localhost',
		topics: ['a test'],
		port: 8887
	},
];

function App(): JSX.Element {
	const [cur_site, setCurSite] = useState(0);
	const [all_site, setAllSite] = useState(sites);
	const [cur_topics, setCurTopics] = useState(all_site.map(() => 0));

	function setCurTopic(index: number): void {
		let new_cur_topics = [...cur_topics];
		new_cur_topics[cur_site] = index;
		setCurTopics(new_cur_topics);
	}

	return (
		<SiteCtx.Provider value={{ cur_site, setCurSite, all_site, setCurTopic, cur_topics }}>
			<div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
				<MQHeader />
				<div style={{ display: 'flex', flex: 1 }}>
					<TopicBar />
					<MessageBody site={all_site[0]} />
				</div>
			</div>
		</SiteCtx.Provider>
	);
}

ReactDOM.render(
	<App />,
	document.getElementById('root')
);