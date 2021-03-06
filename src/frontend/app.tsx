import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { MQHeader } from './mq_header';
import { SiteInfo, ConnectState, TopicInfo } from '../core/site_info';
import { SiteCtx } from './context';
import { TopicBar } from './topic_bar';
import { MessageBody } from './message_body';
import { onSwitchPage, clearSwitchTopic, onSwitchTopic, askConfig, clearSwitchPage } from './ipc_render';

function App(): JSX.Element {
	const [cur_site, setCurSite] = useState(0);
	const [all_site, setAllSite] = useState<SiteInfo[]>([]);
	const [cur_topics, setCurTopics] = useState<number[]>([]);
	const [all_states, setAllStates] = useState<ConnectState[]>([]);
	const [mute, setMute] = useState(false);

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
	function addTopic(topic: TopicInfo): void {
		let new_sites = [...all_site];
		let site = new_sites[cur_site];
		if (!site.topics.find(t => t.name == topic.name)) {
			site.topics.push(topic);
		}
		setAllSite(new_sites);
	}

	useEffect(() => {
		askConfig().then(config => {
			const { file_url, sites } = config;
			document.title = `MQTT 救星 - 全面升級你的 MQTT 體驗 - ${file_url}`;
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
		<SiteCtx.Provider value={{ mute, addTopic, cur_site, all_states, setCurSite, all_site, setCurTopic, cur_topics, setCurState }}>
			<div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
				<MQHeader setMute={(m: boolean) => setMute(m)} />
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