import React, { useContext, useEffect, useState } from 'react';
import { MQClientCtx } from './context';
import { MyMQClient } from './mqtt_client';
import { SiteCtx } from './context';
import { SiteState } from '../core/site_state';

export function MessageBody(params: { site: SiteState }): JSX.Element {
    let [has_selected, setHasSelected] = useState(false);
    let [ready, setReady] = useState(false);
    let [client, setClient] = useState(new MyMQClient(params.site));
    const { cur_site, all_site } = useContext(SiteCtx);
    const is_selected = (params.site === all_site[cur_site]);

    useEffect(() => {
        if (is_selected == true && !has_selected) {
            setHasSelected(true);
            client.connect().then(() => {
                // sub all topics
                setReady(true);
            }).catch(err => {
                alert(err);
            });
        }
    }, [is_selected, has_selected]);
    
    if (ready) {
        return <div className='message-body'>
            main body
	    </div>;
    } else {
        return <div className='message-body'/>;
    }
}