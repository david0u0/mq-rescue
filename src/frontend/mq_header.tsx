import React, { useContext } from 'react';
import { SiteInfo } from '../core/site_info';
import { SiteCtx } from './context';

type LabelParam = {
	site: SiteInfo,
	selected?: boolean,
	onClick: () => void
};

function MQLabel(params: LabelParam): JSX.Element {
	return (
		<div className="mq-label" onClick={params.onClick} style={{
			borderBottomStyle: params.selected ? 'none' : 'solid'
		}}>
			{params.site.name}
		</div>
	);
}

export function MQHeader(): JSX.Element {
	const { cur_site, setCurSite, all_site, cur_state } = useContext(SiteCtx);
	let cur_site_obj = all_site[cur_site];
	let status_msg = `${cur_site_obj.addr}:${cur_site_obj.port} ${cur_state}`;
	return (
		<div>
			<div style={{ display: 'flex' }}>
				<>
					{
						all_site.map((site, i) => {
							return <MQLabel
								key={i} site={site}
								selected={cur_site == i}
								onClick={() => {
									setCurSite(i);
								}} />;
						})
					}
					<div className="mq-label" style={{ flex: 1 }} />
				</>
			</div>
			<div className='mq-status-bar'>
				<p>{status_msg}</p>
			</div>
		</div>
	);
}