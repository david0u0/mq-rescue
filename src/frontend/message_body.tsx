import React, { useContext, useEffect, useState } from 'react';
import { MyMQClient } from './mqtt_client';
import { SiteCtx } from './context';
import { SiteInfo } from '../core/site_info';

export function MessageBody(params: { site: SiteInfo }): JSX.Element {
    let [has_selected, setHasSelected] = useState(false);
    let [ready, setReady] = useState(false);
    let [client, setClient] = useState(new MyMQClient(params.site));
    let [msg_map, setMsgMap] = useState<{ [topic: string]: string[] }>({})
    const { cur_site, all_site, setCurState, cur_topics } = useContext(SiteCtx);
    const is_selected = (params.site === all_site[cur_site]);

    let cur_topic = all_site[cur_site].topics[cur_topics[cur_site]];

    useEffect(() => {
        if (is_selected == true && !has_selected) {
            setHasSelected(true);
            setCurState(client.conn_state);
            client.connect().then(() => {
                // sub all topics
                setCurState(client.conn_state);
                for(let topic of params.site.topics) {
                    // TODO: 用一些厲害的函式庫優化底下這些厚重的複製！
                    setMsgMap(msg_map => {
                        let new_msg_map = { ...msg_map };
                        new_msg_map[topic.name] = [];
                        return new_msg_map;
                    });
                    // 註冊
                    client.sub(topic.name, msg => {
                        setMsgMap(msg_map => {
                            let new_msg_map = { ...msg_map };
                            new_msg_map[topic.name] = [...new_msg_map[topic.name], msg];
                            return new_msg_map;
                        });
                    });
                }
                setReady(true);
            }).catch(err => {
                setCurState(client.conn_state);
            });
        }
    }, [is_selected, has_selected]);

    if (!is_selected) {
        return null;
    } else if (!ready) {
        return <div className='message-body'/>;
    } else {
        return <div className='message-body'>
            <h3>{cur_topic.name}</h3>
            <hr/>
            {
                msg_map[cur_topic.name].map((msg, i) => {
                    // TODO: 顯示得好看一點
                    return <div key={i}>
                        <pre>{msg}</pre>
                        <hr/>
                    </div>;
                })
            }
	    </div>;
    }
}