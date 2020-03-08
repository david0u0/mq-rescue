import { app, BrowserWindow } from 'electron';
import { onConnMQTT, emitSwitchPage, sendMsg, onSubMQTT, onPubMQTT, emitSwitchTopic, onGetCaches, onSetCache, emitToggleWriting, emitFireMessage, onAskConfig } from './ipc_main';
import { SiteInfo } from '../core/site_info';
import { MyMQClient } from './mqtt_client';
import { encode, decode } from './proto_helper';
import * as electronLocalshortcut from 'electron-localshortcut';
import { getCaches, storeCache } from './storage';
import { loadConfig } from './load_config';

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
	win.on('closed', () => {
		win = null;
	});
	win.setMenu(null);
	if (MODE == 'debug') {
		win.webContents.openDevTools();
	}
	win.loadFile('index.html');
	// 分頁熱鍵
	let f_keys = ['F1','F2','F3','F4','F5','F6','F7']; // 應該沒人會開七個分頁吧……
	for (let [i, key] of f_keys.entries()) {
		electronLocalshortcut.register(win, key, (() => {
			if (win != null) {
				emitSwitchPage(win.webContents, i);
			}
		}));
	}
	// 切頻道熱鍵
	electronLocalshortcut.register(win, 'Ctrl+Up', () => {
		if (win != null) {
			emitSwitchTopic(win.webContents, true);
		}
	});
	electronLocalshortcut.register(win, 'Ctrl+Down', () => {
		if (win != null) {
			emitSwitchTopic(win.webContents, false);
		}
	});
	// 熱鍵開關文字方塊
	electronLocalshortcut.register(win, 'Ctrl+X', () => {
		if (win != null) {
			emitToggleWriting(win.webContents);
		}
	});
	// 熱鍵發送訊息
	electronLocalshortcut.register(win, 'Ctrl+P', () => {
		if (win != null) {
			emitFireMessage(win.webContents);
		}
	});
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

let sites = loadConfig();
let client_map: { [name: string]: MyMQClient } = {};
for (let site of sites) {
	client_map[site.name] = new MyMQClient(site);
}

// 將設定檔內容打到前端
onAskConfig(() => {
	return sites;
});

onConnMQTT(async (sender, mqtt_name) => {
	let client = client_map[mqtt_name];
	if (client) {
		try {
			// 一旦前端說要存快取到本地端，就幫它存
			onSetCache(mqtt_name, msg_topic => {
				storeCache(mqtt_name, msg_topic.topic, msg_topic.msg);
			});
			// 實際連上
			await client.connect();
			// 收到任何訊息都往前端灌
			client.onMsg(async (topic_name, msg) => {
				let cur_topic_info = client.site.topics.find(topic => topic.name == topic_name);
				if (cur_topic_info) {
					let msg_decoded = await decode(cur_topic_info, msg);
					sendMsg(sender, mqtt_name, { topic: topic_name, msg: msg_decoded });
				} else {
					throw `找不到頻道：${topic_name}`;
				}
			});
			// 一旦前端說要註冊什麼東西，就幫它註冊
			onSubMQTT(mqtt_name, topic => {
				client.sub(topic);
			});
			// 一旦前端說要發送什麼東西，就幫它發送
			onPubMQTT(mqtt_name, async (msg_topic) => {
				let cur_topic_info = client.site.topics.find(topic => topic.name == msg_topic.topic);
				if (cur_topic_info) {
					let msg_encoded = await encode(cur_topic_info, msg_topic.msg);
					client.pub(msg_topic.topic, msg_encoded);
				} else {
					throw `找不到頻道：${msg_topic.topic}`;
				}
			});
		} catch (err) {
			console.log(err);
			throw err;
		}
	} else {
		throw `找不到站點：${mqtt_name}`;
	}
});

onGetCaches(async (mqtt_name) => {
	// 把存起來的訊息往前端灌
	let msg_map = await getCaches(mqtt_name);
	return msg_map;
});
