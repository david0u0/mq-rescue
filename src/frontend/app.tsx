import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MQHeader } from './mq_header';
import { SiteInfo, ConnectState } from '../core/site_info';
import { SiteCtx } from './context';
import { TopicBar } from './topic_bar';
import { MessageBody } from './message_body';
import { onSwitchPage, clearSwitchTopic, onSwitchTopic, askConfig, clearSwitchPage } from './ipc_render';

function App(): JSX.Element {
	const [cur_site, setCurSite] = useState(0);
	const [all_site, setAllSite] = useState<SiteInfo[]>([]);
	const [cur_topics, setCurTopics] = useState<number[]>([]);
	const [all_states, setAllStates] = useState<ConnectState[]>([]);

	function setCurTopic(index: number): void {
		let new_cur_topics = [...cur_topics];
		new_cur_topics[cur_site] = index;
		setCurTopics(new_cur_topics);
	}
	function setCurState(state: ConnectState): void {
		let new_all_states = [...all_states];
		new_all_states[cur_site] = state;
		setAllStates(new_all_states);
	}

	useEffect(() => {
		askConfig().then(dir_and_sites => {
			const [config_dir, sites] = dir_and_sites; // TODO: 記憶設定檔資料夾
			setAllSite(sites);
			setCurTopics(sites.map(() => 0));
			setAllStates(sites.map(() => ConnectState.Idle));
		});
	}, []);

	clearSwitchPage();
	onSwitchPage(page => {
		if (page < all_site.length) {
			setCurSite(page);
		}
	});
	clearSwitchTopic();
	onSwitchTopic(is_up => {
		let topic_len = all_site[cur_site].topics.length;
		let new_cur_topic = cur_topics[cur_site] + (is_up ? -1 : 1);
		new_cur_topic = (new_cur_topic + topic_len) % (topic_len);
		setCurTopic(new_cur_topic);
	});

	if (all_site.length == 0) {
		return <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}/>;
	}

	return (
		<SiteCtx.Provider value={{ cur_site, all_states, setCurSite, all_site, setCurTopic, cur_topics, setCurState }}>
			<div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
				<MQHeader />
				<div style={{ display: 'flex', flex: 1, width: '100%' }}>
					{
						all_site.map(site => {
							return <TopicBar site={site} key={site.name}/>;
						})
					}
					{
						all_site.map(site => {
							return <MessageBody site={site} key={site.name}/>;
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