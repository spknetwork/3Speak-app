import path from 'path'
import { app, BrowserWindow } from 'electron'
import debug from 'debug'
import { CoreService } from './core'
import IpcAdapter from './ipcAdapter'
import AutoUpdater from './AutoUpdater'
import dotenv from 'dotenv'
dotenv.config()

const entryUrl =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:6789/index.html'
    : `file://${path.join(__dirname, 'index.html')}`

if (process.env.NODE_ENV === 'development') {
  debug.enable('3speak:*')
}

let window = null
const core = new CoreService(undefined as any)

const gotTheLock = app.requestSingleInstanceLock()

app.removeAsDefaultProtocolClient('speak')
app.setAsDefaultProtocolClient('speak', process.execPath)
function devToolsLog(s) {
  if (window && window.webContents) {
    window.webContents.executeJavaScript(`console.log("${s}")`)
  }
}
app.on('open-url', (event, url) => {
  // handle the data
  devToolsLog('process args ' + url)
  if (url.includes('speak://')) {
    const UrlWoo = new URL(url)
    window.loadURL(entryUrl + UrlWoo.hash)
  }
})

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, argv, workingDirectory) => {
    if (window) {
      if (window.isMinimized()) window.restore()
      window.focus()
      const theUrl = argv[argv.length - 1]
      if (theUrl.includes('speak://')) {
        const UrlWoo = new URL(theUrl)
        window.loadURL(entryUrl + UrlWoo.hash)
      } else {
        window.loadURL(entryUrl)
      }
    }
  })

  app.on('ready', () => {
    window = new BrowserWindow({
      width: 800,
      height: 600,
      icon: path.resolve(__dirname, '../renderer/assets/img/app.png'),
      webPreferences: {
        nodeIntegration: true,
        webSecurity: false,
        webviewTag: true,
        contextIsolation: false,
      },
    })
    const theUrl = process.argv[process.argv.length - 1]
    if (theUrl.includes('speak://')) {
      const UrlWoo = new URL(theUrl)
      window.loadURL(entryUrl + UrlWoo.hash)
    } else {
      window.loadURL(entryUrl)
    }
    window.on('closed', () => (window = null))
  })
}

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors')
app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    await core.stop()
    app.quit()
  }
})

async function startup(): Promise<void> {
  const updater = new AutoUpdater()
  void updater.run()

  try {
    new IpcAdapter(core).start()
    await core.start()
  } catch (ex) {
    console.error(ex)
    app.quit()
  }
}

void startup()

process.on('unhandledRejection', (err: Error) => {
  console.log(err)
  core.logger.error(`Unhandled rejection!`)
  core.logger.error(err.message)
  core.logger.error(err.stack)
  core.logger.error(`Halting process with error code 1.`)
  process.exit(1)
})

process.on('uncaughtException', (err: Error) => {
  console.log('err', err)
  core.logger.error(`Uncaught exception!`)
  core.logger.error(err.message)
  core.logger.error(err.stack)
  core.logger.error(`Halting process with error code 1.`)
  process.exit(1)
})
