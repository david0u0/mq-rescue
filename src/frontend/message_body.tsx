import React, { useContext, useEffect, useState } from 'react';
import { MyMQClient } from './mqtt_client';
import { SiteCtx } from './context';
import { SiteInfo, ConnectState } from '../core/site_info';
import { filterHasWildcard } from '../core/util';

export function MessageBody(params: { site: SiteInfo }): JSX.Element {
	let [has_selected, setHasSelected] = useState(false);
	let [ready, setReady] = useState(false);
	let [client, setClient] = useState(new MyMQClient(params.site));
	let [msg_map, setMsgMap] = useState<{ [topic: string]: string[] }>({});
	let [search_str, setSearchStr] = useState('');
	const { cur_site, all_site, setCurState, cur_topics } = useContext(SiteCtx);
	const is_selected = (params.site === all_site[cur_site]);

	let cur_topic = all_site[cur_site].topics[cur_topics[cur_site]];

	useEffect(() => {
		if (is_selected == true && !has_selected) {
			setHasSelected(true);
			setCurState(ConnectState.Wait);
			client.connect().then(() => {
				// sub all topics
				setCurState(client.conn_state);
				for (let topic of params.site.topics) {
					// TODO: 用一些厲害的函式庫優化底下這些厚重的複製！
					setMsgMap(msg_map => {
						let new_msg_map = { ...msg_map };
						new_msg_map[topic.name] = [];
						return new_msg_map;
					});
					// 註冊
					client.sub(topic.name, (topic_str, msg) => {
						setMsgMap(msg_map => {
							if (filterHasWildcard(topic.name)) {
								// 補上主題名字
								msg = topic_str + '\n--------\n' + msg;
							}
							let new_msg_map = { ...msg_map };
							new_msg_map[topic.name] = [...new_msg_map[topic.name], msg];
							return new_msg_map;
						});
					});
				}
				setReady(true);
			}).catch(err => {
				alert(err);
				setCurState(client.conn_state);
			});
		}
	}, [is_selected, has_selected]);

	let clearTopic = () => {
		setMsgMap(msg_map => {
			let new_map = { ...msg_map };
			new_map[cur_topic.name] = [];
			return new_map;
		});
	};

	if (!is_selected) {
		return null;
	} else if (!ready) {
		return <div className='message-body'/>;
	} else {
		return <div className='message-body'>
			<div style={{ display: 'flex' }}>
				<h2>{cur_topic.name}</h2>
				<div style={{ flex: 1 }}/>
				<input type="text" value={search_str} placeholder="搜尋" onChange={evt => setSearchStr(evt.currentTarget.value)}/>
				<button onClick={() => clearTopic()}>清空頻道</button>
			</div>
			<hr/>
			<div style={{ overflowY: 'scroll', flex: 1 }}>
				{
					msg_map[cur_topic.name].map((msg, i) => {
						return <BoxWithHighlight msg={msg} search_str={search_str} key={i}/>;
					})
				}
			</div>
		</div>;
	}
}

export function BoxWithHighlight(params: { msg: string, search_str: string }): JSX.Element {
	// TODO: 顯示得好看一點
	if (params.search_str == '') {
		return <div>
			<pre className="message-block">{params.msg}</pre>
			<hr />
		</div>;
	} else {
		let search_index = params.msg.indexOf(params.search_str);
		if (search_index == -1) {
			return null;
		} else {
			let inner: JSX.Element[] = [];
			let remain_string = params.msg;
			while (search_index != -1) {
				inner.push(<span>{remain_string.substring(0, search_index)}</span>);
				inner.push(<span className='highlight'>{params.search_str}</span>);
				remain_string = remain_string.substring(search_index + params.search_str.length);
				search_index = remain_string.indexOf(params.search_str);
			}
			inner.push(<span>{remain_string}</span>);
			return <div>
				<pre className="message-block">
					{inner}
				</pre>
				<hr />
			</div>;
		}
	}
}