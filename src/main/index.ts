import { app, BrowserWindow } from 'electron';
import { onConnMQTT, sendMsg, onSubMQTT, onPubMQTT } from './ipc_main';
import { SiteInfo } from '../core/site_info';
import { MyMQClient } from './mqtt_client';

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
				sendMsg(sender, mqtt_name, { topic, msg });
			});
			// 一旦前端說要註冊什麼東西，就幫它註冊
			onSubMQTT(mqtt_name, topic => {
				client.sub(topic);
			});
			//
			onPubMQTT(mqtt_name, msg_topic => {
				client.pub(msg_topic.topic, msg_topic.msg);
			});
		} catch(err) {
			console.log(err);
			throw err;
		}
	} else {
		throw `找不到站點：${mqtt_name}`;
	}
});
