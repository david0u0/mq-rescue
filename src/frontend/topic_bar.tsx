import React, { useContext, useState, useEffect, useRef } from 'react';
import { SiteCtx } from './context';
import { pubMQTT, getCaches, setCache, onToggleWriting, onFireMessage, onMsgMQTT } from './ipc_render';
import { SiteInfo } from '../core/site_info';
import { filterHasWildcard } from '../core/util';
// TODO: 把上述函式包進 mqtt client 中！

enum SendOption {
	Change,
	Start,
	Cancel,
	Send
}

export function TopicBar(params: { site: SiteInfo }): JSX.Element {
	const { cur_site, setCurTopic, all_site, cur_topics } = useContext(SiteCtx);
	const topics = params.site.topics;
	const [writing, setWriting] = useState<undefined | number>(undefined);
	const [msg_map, setMsgMap] = useState<{ [topic: string]: string }>({});
	const [has_load_cache, setHasLoadCahce] = useState(false);
	const is_selected = (params.site.name === all_site[cur_site].name);

	onToggleWriting(params.site.name, () => {
		if (is_selected) {
			let cur_topic = cur_topics[cur_site];
			if (typeof writing == 'undefined' || cur_topic != writing) {
				setWriting(cur_topic);
			} else if (writing == cur_topic) {
				setWriting(undefined);
			}
		}
	});

	useEffect(() => {
		if (is_selected && !has_load_cache) {
			setHasLoadCahce(true);
			getCaches(params.site.name).then(msg_map => {
				setMsgMap(msg_map);
			});
		}
	}, [is_selected]);

	return (
		<div className='topic-bar' style={{ display: is_selected ? 'block' : 'none' }}>
			{
				topics.map((topic, i) => {
					let is_cur_topic = cur_topics[cur_site] == i;
					let is_writing = (typeof writing != 'undefined') && writing == i;
					return <TopicBlock key={`${params.site.name}/${topic.name}`}
						default_msg={msg_map[topic.name]}
						is_writing={is_writing && is_selected} name={topic.name} is_cur_topic={is_cur_topic}
						site={params.site}
						onClick={() => {
							setCurTopic(i);
						}}
						onSendOption={async (opt, msg) => {
							if (opt == SendOption.Start) {
								setWriting(i);
							} else if (opt == SendOption.Cancel) {
								setWriting(undefined);
							} else if (opt == SendOption.Change) {
								setCache(params.site.name, { topic: topic.name, msg });
							} else {
								// TODO: 這段期間禁止再次發送
								try {
									await pubMQTT(params.site.name, { topic: topic.name, msg });
								} catch (err) {
									alert(`編碼失敗！${err}`);
								}
							}
						}} />;
				})
			}
		</div>
	);
}

type TopicBlockParams = {
	name: string,
	site: SiteInfo,
	is_writing: boolean,
	is_cur_topic: boolean,
	default_msg: string,
	onClick: () => void,
	onSendOption: (opt: SendOption, msg?: string) => void
};

function TopicBlock(params: TopicBlockParams): JSX.Element {
	const [message, setMessage] = useState('');
	const [unread, setUnread] = useState(0);
	const latestIsCurTopic = useRef(params.is_cur_topic);

	useEffect(() => {
		setMessage(params.default_msg);
	}, [params.default_msg]);

	useEffect(() => {
		if (params.is_cur_topic) {
			setUnread(0);
		}
	}, [params.is_cur_topic]);

	useEffect(() => {
		onMsgMQTT(params.site.name, ({ topic }) => {
			if (!latestIsCurTopic.current && topic == params.name) {
				setUnread(unread => unread + 1);
			}
		});
		// FIXME: 沒有清理函式，可能會有記憶體危機
	}, []);


	onFireMessage(params.name, () => {
		if (params.is_writing) {
			params.onSendOption(SendOption.Send, message);
		}
	});

	return <div onClick={params.onClick} style={{
		backgroundColor: params.is_cur_topic ? '#85bffa' : 'inherit',
		display: 'flex'
	}}>
		<div style={{ flex: 1 }} />
		<div style={{ flex: 10, paddingTop: '4px', paddingBottom: '4px' }}>
			<div>{params.name} <span className='unread'>{unread}</span></div>
			{
				(() => {
					if (filterHasWildcard(params.name)) {
						return null;
					}
					if (params.is_writing) {
						return <div>
							<textarea className='send-message-area' value={message} autoFocus
								onChange={evt => {
									setMessage(evt.target.value);
									// 記錄至後端
									params.onSendOption(SendOption.Change, evt.target.value);
								}}
								onClick={evt => {
									evt.stopPropagation();
								}} />
							<br />
							<button onClick={evt => {
								params.onSendOption(SendOption.Cancel);
								evt.stopPropagation();
							}}>取消</button>
							<button onClick={evt => {
								params.onSendOption(SendOption.Send, message);
								evt.stopPropagation();
							}}>傳送</button>
						</div>;
					} else {
						return <button onClick={evt => {
							params.onSendOption(SendOption.Start);
							evt.stopPropagation();
						}}>發訊息</button>;
					}
				})()
			}
		</div>
		<div style={{ flex: 1 }} />
	</div>;
}