import React, { useContext, useState, useEffect, useRef } from 'react';
import { SiteCtx } from './context';
import { pubMQTT } from './ipc_render';
// TODO: 把上述函式包進 mqtt client 中！

enum SendOption {
	Start,
	Cancel,
	Send
}

export function TopicBar(): JSX.Element {
	const { cur_site, setCurTopic, all_site, cur_topics } = useContext(SiteCtx);
	const topics = all_site[cur_site].topics;
	const [writing, setWriting] = useState<undefined | number>(undefined);

	useEffect(() => {
		setWriting(undefined);
	}, [cur_site]);

	return (
		<div className='topic-bar'>
			<>
				{
					topics.map((topic, i) => {
						let is_cur_topic = cur_topics[cur_site] == i;
						let is_writing = (typeof writing != 'undefined') && writing == i;
						return <TopicBlock key={cur_site * 1000 + i}
							is_writing={is_writing} name={topic.name} is_cur_topic={is_cur_topic}
							onClick={() => {
								setCurTopic(i);
							}}
							onSendOption={async (opt, msg) => {
								if (opt == SendOption.Start) {
									setWriting(i);
								} else if (opt == SendOption.Cancel) {
									setWriting(undefined);
								} else {
									// TODO: 這段期間禁止再次發送
									try {
										await pubMQTT(all_site[cur_site].name, { topic: topic.name, msg });
									} catch(err) {
										alert(`編碼失敗！${err}`);
									}
								}
							}}/>;
					})
				}
			</>
		</div>
	);
}

type TopicBlockParams = {
	name: string,
	is_writing: boolean,
	is_cur_topic: boolean,
	onClick: () => void,
	onSendOption: (opt: SendOption, msg?: string) => void
};

function TopicBlock(params: TopicBlockParams): JSX.Element {
	const [message, setMessage] = useState('');
	return <div onClick={params.onClick} style={{
		backgroundColor: params.is_cur_topic ? '#85bffa' : 'inherit',
		display: 'flex'
	}}>
		<div style={{ flex: 1 }}/>
		<div style={{ flex: 8, paddingTop: '4px', paddingBottom: '4px' }}>
			<div>{params.name}</div>
			{
				(() => {
					if (params.is_writing) {
						return <div>
							<textarea className='send-message-area' value={message} autoFocus
								onChange={evt => setMessage(evt.target.value)}
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
		<div style={{ flex: 1 }}/>
	</div>;
}