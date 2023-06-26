import { IPFSHTTPClient } from 'ipfs-http-client'
import winston from 'winston'
import execa from 'execa'
import Components from './components'
import DistillerDB from './components/DistillerDB'
import { EncoderService } from './components/EncoderService'
import { IpfsHandler } from './components/ipfsHandler'
const goENV = require('go-platform')
const EventEmitter = require('events')
const Utils = require('./utils')
const fs = require('fs')
const waIpfs = require('wa-go-ipfs')
const mergeOptions = require('merge-options')


export class CoreService {
  _options: any
  events: any
  start_progress: any
  config: any
  distillerDB: DistillerDB
  blocklist: any
  encoder: EncoderService
  accounts: any
  ipfs: IPFSHTTPClient
  pins: any
  logger: winston.Logger

  constructor(options: any) {
    const defaults = {
      path: Utils.getRepoPath(),
    }
    this._options = mergeOptions(defaults, options)
    this.events = new EventEmitter()
    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.start_progress = { ready: false, message: null, ipfsDownloadPct: null }
  }
  async install() {
    this.start_progress.message = 'Installing IPFS'
    await waIpfs.install({
      version: 'v0.16.0',
      dev: false,
      recursive: true,
      progressHandler: (pct) => {
        this.start_progress.ipfsDownloadPct = pct
      }
    })
    console.log('its been installed!')
    await new Promise<void>((resolve) => {
      setTimeout(async () => {
        const ipfsInfo = await IpfsHandler.getIpfs()
        this.start_progress.message = 'Initializing IPFS'
        try {
          await IpfsHandler.init(ipfsInfo.ipfsPath)
        } catch {

        }
        this.start_progress.message = null
        resolve()
      }, 5000)
    })
  }
  async status() {
    const ipfs_path = waIpfs.getDefaultPath()
    return {
      ipfs_installed: fs.existsSync(ipfs_path),
      ipfs_path,
      ready: this.start_progress.ready,
      start_progress: this.start_progress,
    }
  }
  ready() {
    return new Promise<void>((resolve, reject) => {
      if (this.start_progress.ready === true) {
        resolve()
      } else {
        this.events.once('ready', () => {
          resolve()
        })
      }
    })
  }

  async start() {
    if (!fs.existsSync(this._options.path)) {
      fs.mkdirSync(this._options.path)
    }

    try {
      const ipfsPath = await waIpfs.getPath(
        waIpfs.getDefaultPath({ dev: process.env.NODE_ENV === 'development' }),
      )
      if (goENV.GOOS === 'darwin' || goENV.GOOS === 'linux') {
        try {
          fs.accessSync(ipfsPath, fs.constants.X_OK)
        } catch {
          fs.chmodSync(ipfsPath, 755)
        }
      }
      const output = await execa(ipfsPath, ['version', '-n'])
      console.log(output)
      if(output.stdout !== "0.16.0") {
        console.log('Ipfs not up to date')
        throw new Error('Ipfs not up to date')
      }
    } catch {
      console.log('installing ipfs update')
      try {
        await this.install()
      } catch(ex) {
        console.log(ex)
      }
    }

    this.config = new Components.Config(this._options.path)
    this.distillerDB = new DistillerDB(this)
    this.blocklist = new Components.Blocklist(this)
    this.encoder = new Components.EncoderService(this)
    this.accounts = new Components.AccountSystem(this)
    await this.accounts.start()
    this.logger = Components.MakeLogger(this._options.path)
    await this.config.open()
    console.log(`setting start message`)
    this.start_progress.message = 'Starting IPFS'
    await IpfsHandler.start(this._options.path)

    console.log(`1`)
    const { ipfs } = await IpfsHandler.getIpfs()
    console.log(`2`)
    this.ipfs = ipfs
    try {
      console.log(`3`)
      const peerInfo = await this.ipfs.id()
      this.logger.info(`IPFS operational with PeerID of ${peerInfo.id}`)
    } catch (ex) {
      this.logger.error(ex)
    }
    this.pins = new Components.Pins(this)
    await this.pins.start()
    this.events.emit('ready')
    this.start_progress.ready = true
    this.start_progress.message = null

    console.log('starting message LOOP')
    setInterval(async () => {
      console.log(IpfsHandler.isReady)
      try {
        const peerIds = (await this.ipfs.config.get('Bootstrap')) as any
        for (const peerId of peerIds) {
          try {
            await this.ipfs.swarm.connect(peerId)
          } catch {}
        }
      } catch {

      }
    }, 60000)
  }

  async stop(options: any = {}) {
    if (options.background !== true) {
      await IpfsHandler.stop(this._options.path)
    }
    await this.pins.stop()
    this.logger.info(`App shutting down`)
  }
}
