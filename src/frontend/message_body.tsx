import React, { useContext, useEffect, useState } from 'react';
import { MyMQClient } from './mqtt_client';
import { SiteCtx } from './context';
import { SiteInfo } from '../core/site_info';

export function MessageBody(params: { site: SiteInfo }): JSX.Element {
    let [has_selected, setHasSelected] = useState(false);
    let [ready, setReady] = useState(false);
    let [client, setClient] = useState(new MyMQClient(params.site));
    const { cur_site, all_site, setCurState } = useContext(SiteCtx);
    const is_selected = (params.site === all_site[cur_site]);

    useEffect(() => {
        if (is_selected == true && !has_selected) {
            setHasSelected(true);
            setCurState(client.conn_state);
            client.connect().then(() => {
                // sub all topics
                setReady(true);
                setCurState(client.conn_state);
            }).catch(err => {
                alert(err);
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
            main body
	    </div>;
    }
}