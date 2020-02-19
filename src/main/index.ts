import { app, BrowserWindow } from 'electron';
import { onConnMQTT, sendMsg, onSubMQTT, onPubMQTT } from './ipc_main';
import { SiteInfo } from '../core/site_info';
import { MyMQClient } from './mqtt_client';
import { encode, decode } from './proto_helper';

let MODE: 'debug' | 'release' = (() => {
	if (process.env.MODE == 'debug') {
		return 'debug';
	} else {
		return 'release';
	}
})();

let win: null | BrowserWindow;

function createWindow(): void {
	win = new BrowserWindow({
		width: 1000,
		height: 800,
		webPreferences: {
			nodeIntegration: true,
		}
	});
	win.loadFile('index.html');
	win.on('closed', () => {
		win = null;
	});
	win.setMenu(null);
	if (MODE == 'debug') {
		win.webContents.openDevTools()
	}
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
	if (process.platform != 'darwin') {
		app.quit();
	}
});
app.on('activate', () => {
	if (win == null) {
		createWindow();
	}
});


let sites: SiteInfo[] = require('../../config.json');
let client_map: { [name: string]: MyMQClient } = {};
for (let site of sites) {
	client_map[site.name] = new MyMQClient(site);
}

onConnMQTT(async (sender, mqtt_name) => {
	let client = client_map[mqtt_name];
	if (client) {
		try {
			await client.connect();
			// 收到任何訊息都往前端灌
			client.onMsg(async (topic_name, msg) => {
				let cur_topic_info = client.site.topics.find(topic => topic.name == topic_name);
				if (cur_topic_info) {
					let msg_decoded = await decode(cur_topic_info, msg)
					sendMsg(sender, mqtt_name, { topic: topic_name, msg: msg_decoded });
				} else {
					throw `找不到頻道：${topic_name}`;
				}
			});
			// 一旦前端說要註冊什麼東西，就幫它註冊
			onSubMQTT(mqtt_name, topic => {
				client.sub(topic);
			});
			//
			onPubMQTT(mqtt_name, async (msg_topic) => {
				let cur_topic_info = client.site.topics.find(topic => topic.name == msg_topic.topic);
				if (cur_topic_info) {
					let msg_encoded = await encode(cur_topic_info, msg_topic.msg)
					client.pub(msg_topic.topic, msg_encoded);
				} else {
					throw `找不到頻道：${msg_topic.topic}`;
				}
			});
		} catch(err) {
			//console.log(err);
			throw err;
		}
	} else {
		throw `找不到站點：${mqtt_name}`;
	}
});

