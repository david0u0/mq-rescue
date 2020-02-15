import { app, BrowserWindow } from 'electron';

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