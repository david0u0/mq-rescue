import React, { useContext, useEffect, useState } from 'react';
import { MQClientCtx } from './context';
import { MyMQClient } from './mqtt_util';
import { SiteState } from '../core/site_state';

export function MessageBody(params: { is_selected: boolean, site: SiteState }): JSX.Element {
    let [has_selected, setHasSelected] = useState(false);
    let [ready, setReady] = useState(false);
    let [client, setClient] = useState(new MyMQClient(params.site));

    useEffect(() => {
        if (params.is_selected == true && !has_selected) {
            setHasSelected(true);
            client.connect().then(() => {
                setReady(true);
            });
        }
    }, [params.is_selected, has_selected]);

    

    return <div className='message-body'>
        main body
	</div>;
}