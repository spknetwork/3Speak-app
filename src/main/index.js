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
  debug.enable("3speak:*");
}

let window = null;
let coreInstance = new Core();

<<<<<<< HEAD
app.on('ready', () => {
  window = new BrowserWindow({width: 800, height: 600,
    icon: path.resolve(__dirname, "../renderer/assets/img/app.png"),
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      webviewTag: true
=======
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (window) {
      if (window.isMinimized()) window.restore()
      window.focus()
>>>>>>> 676c66eb4f8c79b3656eb743d9274cabc13f01d0
    }
  })

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
}

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