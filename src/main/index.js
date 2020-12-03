import path from 'path';
import {app, BrowserWindow} from 'electron';
import debug from 'debug'
import Core from './core'
import ipcAdapter from './ipcAdapter'
import AutoUpdator from './AutoUpdater'

const entryUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:6789/index.html'
  : `file://${path.join(__dirname, 'index.html')}`;

if(process.env.NODE_ENV === 'development') {
  debug.enable("blasio:*");
}

let window = null;
let coreInstance = new Core();

app.on('ready', () => {
  window = new BrowserWindow({width: 800, height: 600,
    icon: path.resolve(__dirname, "../renderer/assets/img/app.png"),
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      webviewTag: true
    }
  });
  window.loadURL(entryUrl);
  window.on('closed', () => window = null);
});
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.on('window-all-closed', async () => {
  if(process.platform !== 'darwin') {
    await coreInstance.stop();
    app.quit();
  }
});
(async () => {
  new AutoUpdator().run();
  try {
    new ipcAdapter(coreInstance).start()
    await coreInstance.start()
  } catch (ex) {
    console.log(ex);
    app.quit()
  }
})()