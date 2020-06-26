import path from 'path';
import {app, BrowserWindow} from 'electron';
import debug from 'debug'
const Core = require('./core')
const ipcAdapter = require('./ipcAdapter')

const entryUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:6789/index.html'
  : `file://${path.join(__dirname, 'index.html')}`;

if(process.env.NODE_ENV === 'development') {
  debug.enable("blasio:*");
}

let window = null;

app.on('ready', () => {
  window = new BrowserWindow({width: 800, height: 600});
  window.loadURL(entryUrl);
  window.on('closed', () => window = null);
});

app.on('window-all-closed', () => {
  if(process.platform !== 'darwin') {
    app.quit();
  }
});
let coreInstance = new Core();
(async () => {
  await coreInstance.start()
  new ipcAdapter(coreInstance).start()
})()