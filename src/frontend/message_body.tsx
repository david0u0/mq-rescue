import React, { useContext, useEffect, useState, useRef } from 'react';
import { Map, List } from 'immutable';
import { MyMQClient } from './mqtt_client';
import { SiteCtx } from './context';
import { SiteInfo, ConnectState } from '../core/site_info';

export function MessageBody(params: { site: SiteInfo }): JSX.Element {
	let [has_selected, setHasSelected] = useState(false);
	let [ready, setReady] = useState(false);
	let [client, setClient] = useState(new MyMQClient(params.site));
	let [msg_map, setMsgMap] = useState<Map<string, List<string>>>(Map({}));
	let [search_str, setSearchStr] = useState('');
	const { mute, cur_site, all_site, setCurState, cur_topics } = useContext(SiteCtx);
	const is_selected = (params.site === all_site[cur_site]);

	let mute_ref = useRef(false);
	mute_ref.current = mute;

	let cur_topic = all_site[cur_site].topics[cur_topics[cur_site]];

	useEffect(() => {
		if (is_selected == true && !has_selected) {
			setHasSelected(true);
			setCurState(ConnectState.Wait);
			client.connect().then(() => {
				// sub all topics
				setCurState(client.conn_state);
				for (let topic of params.site.topics) {
					setMsgMap(msg_map => {
						return msg_map.set(topic.name, List([]))
					});
					// 註冊
					client.sub(topic.name, (topic_str, msg) => {
						if (!mute_ref.current) {
							setMsgMap(msg_map => {
								let list = msg_map.get(topic.name).push(msg);
								return msg_map.set(topic.name, list);
							});
						}
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
			return msg_map.set(cur_topic.name, List([]));
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
					msg_map.get(cur_topic.name).map((msg, i) => {
						return <BoxWithHighlight msg={msg} search_str={search_str} key={`${cur_topic.name}/${i}`}/>;
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