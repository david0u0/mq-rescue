import React, { useContext, useRef } from 'react';
import { SiteInfo } from '../core/site_info';
import { SiteCtx } from './context';
import { setConfigFile } from './ipc_render';

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

export function MQHeader(params: { setMute: (boolean) => void }): JSX.Element {
	const { cur_site, setCurSite, all_site, all_states, mute } = useContext(SiteCtx);
	const ref_file = useRef<HTMLInputElement>();
	let cur_site_obj = all_site[cur_site];
	let status_msg = `${cur_site_obj.addr}:${cur_site_obj.port} ${all_states[cur_site]}`;
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
					{
						mute ?
							<button onClick={() => params.setMute(false)}>解除靜音</button> :
							<button onClick={() => params.setMute(true)}>全部靜音</button>
					}
					<div className="mq-label" style={{ flex: 1 }} />
				</>
			</div>
			<div className='mq-status-bar'>
				<p>{status_msg}</p>
				<label style={{ paddingLeft: 15 }}>
					<button onClick={() => ref_file.current.click()}>更換設定檔</button>
					<input type="file" style={{ display: 'none' }} ref={ref_file} onChange={evt => {
						setConfigFile(evt.currentTarget.files[0].path).catch(err => alert(`讀檔失敗 ${err}`));
					}}/>
				</label>
			</div>
		</div>
	);
}