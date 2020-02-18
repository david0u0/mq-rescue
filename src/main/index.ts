import { app, BrowserWindow } from 'electron';
import { onConnMQTT, sendMsg, onSubMQTT, onPubMQTT } from './ipc_main';
import { SiteInfo } from '../core/site_info';
import { MyMQClient } from './mqtt_client';
import { encode } from './proto_helper';

let win: null | BrowserWindow;

function createWindow(): void {
	win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
		}
	});
	win.loadFile('index.html');
	win.on('closed', () => {
		win = null;
	});
	win.setMenu(null);
	// win.webContents.openDevTools()
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
			client.onMsg((topic, msg) => {
				// TODO: protobuf
				sendMsg(sender, mqtt_name, { topic, msg });
			});
			// 一旦前端說要註冊什麼東西，就幫它註冊
			onSubMQTT(mqtt_name, topic => {
				client.sub(topic);
			});
			//
			onPubMQTT(sender, mqtt_name, async (msg_topic) => {
				// TODO: protobuf
				let cur_topic_info = client.site.topics.find(topic => topic.name == msg_topic.topic);
				if (cur_topic_info) {
					encode(cur_topic_info, msg_topic.msg).then(msg_encoded => {
						client.pub(msg_topic.topic, msg_encoded);
					});
				}
			});
		} catch(err) {
			console.log(err);
			throw err;
		}
	} else {
		throw `找不到站點：${mqtt_name}`;
	}
});

