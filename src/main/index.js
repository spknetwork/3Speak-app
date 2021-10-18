import path from 'path';
import { app, BrowserWindow } from 'electron';
import debug from 'debug'
import Core from './core'
import ipcAdapter from './ipcAdapter'
import AutoUpdator from './AutoUpdater'
import dotenv from 'dotenv'
dotenv.config()

const entryUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:6789/index.html'
  : `file://${path.join(__dirname, 'index.html')}`;

if (process.env.NODE_ENV === 'development') {
  debug.enable("3speak:*");
}

let window = null;
let coreInstance = new Core();

const gotTheLock = app.requestSingleInstanceLock()

app.removeAsDefaultProtocolClient("speak")
app.setAsDefaultProtocolClient('speak', process.execPath);
function devToolsLog(s) {
  console.log(s)
  if (window && window.webContents) {
    window.webContents.executeJavaScript(`console.log("${s}")`)
  }
}
app.on('open-url', (event, url) => {
  // handle the data
  console.log(event)
  console.log(`url triggered on procotol: ${url}`)
  devToolsLog('process args ' + url)
  if (url.includes("speak://")) {
    const UrlWoo = require("url").parse(url)
    window.loadURL(entryUrl + UrlWoo.hash);
  }
});


if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, argv, workingDirectory) => {
    if (window) {
      if (window.isMinimized()) window.restore()
      window.focus()
      const theUrl = argv[argv.length - 1];
      if (theUrl.includes("speak://")) {
        const UrlWoo = require("url").parse(theUrl)
        window.loadURL(entryUrl + UrlWoo.hash);
      } else {
        window.loadURL(entryUrl);
      }
    }
  })

  console.log(process.argv)
  app.on('ready', () => {
    window = new BrowserWindow({
      width: 800, height: 600,
      icon: path.resolve(__dirname, "../renderer/assets/img/app.png"),
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false,
        webviewTag: true,
        contextIsolation: false,
      }
    });
    const theUrl = process.argv[process.argv.length - 1];
    if (theUrl.includes("speak://")) {
      const UrlWoo = require("url").parse(theUrl)
      window.loadURL(entryUrl + UrlWoo.hash);
    } else {
      window.loadURL(entryUrl);
    }
    window.on('closed', () => window = null);
  });
}

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
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