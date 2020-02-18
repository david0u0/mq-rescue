import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { MQHeader } from './mq_header';
import { SiteInfo, ConnectState } from '../core/site_info';
import { SiteCtx } from './context';
import { TopicBar } from './topic_bar';
import { MessageBody } from './message_body';

let sites: SiteInfo[] = require('../../config.json');

function App(): JSX.Element {
	const [cur_site, setCurSite] = useState(0);
	const [all_site, setAllSite] = useState(sites);
	const [cur_topics, setCurTopics] = useState(all_site.map(() => 0));
	const [cur_state, setCurState] = useState(ConnectState.Idle);

	function setCurTopic(index: number): void {
		let new_cur_topics = [...cur_topics];
		new_cur_topics[cur_site] = index;
		setCurTopics(new_cur_topics);
	}

	return (
		<SiteCtx.Provider value={{ cur_site, cur_state, setCurSite, all_site, setCurTopic, cur_topics, setCurState }}>
			<div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
				<MQHeader />
				<div style={{ display: 'flex', flex: 1 }}>
					<TopicBar />
					{
						all_site.map(site => {
							return <MessageBody site={site} />
						})
					}
				</div>
			</div>
		</SiteCtx.Provider>
	);
}

ReactDOM.render(
	<App />,
	document.getElementById('root')
);