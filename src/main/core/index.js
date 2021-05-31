import Components from './components';
const goENV = require('go-platform')
const EventEmitter = require('events')
const Utils = require('./utils');
const fs = require('fs');
const waIpfs = require('wa-go-ipfs')
const mergeOptions = require('merge-options')

class Core {
    constructor(options) {
        const defaults = {
            path: Utils.getRepoPath()
        };
        this._options = mergeOptions(defaults, options);
        this.events = new EventEmitter();
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.start_progress = {ready: false, message: null};
    }
    async install() {
        this.start_progress.message = "Installing IPFS";
        await waIpfs.install({version:"v0.8.0", dev: process.env.NODE_ENV === 'development', recursive: true});
        await new Promise(resolve => {
            setTimeout(async () => {
                this.start_progress.message = "Initializing IPFS";
                await Components.ipfsHandler.init();
                this.start_progress.message = null;
                resolve();
            }, 5000);
        })
    }
    async status() {
        var ipfs_path = waIpfs.getDefaultPath();
        return {
            ipfs_installed: fs.existsSync(ipfs_path),
            ipfs_path,
            ready: this.start_progress.ready,
            start_progress: this.start_progress
        }
    }
    ready() {
        return new Promise((resolve, reject) => {
            if(this.start_progress.ready === true) {
                resolve();
            } else {
                this.events.once('ready', () => {
                    resolve();
                })
            }
        })    
    }
    async start() {
        if(!fs.existsSync(this._options.path)) {
            fs.mkdirSync(this._options.path);
        }

        try {
            var ipfsPath = await waIpfs.getPath(waIpfs.getDefaultPath({dev: process.env.NODE_ENV === 'development'}))
            if(goENV.GOOS === "darwin" || goENV.GOOS === "linux") {
                try {
                    fs.accessSync(ipfsPath, fs.constants.X_OK);
                } catch {
                    fs.chmodSync(ipfsPath, 755);
                }
            }
        } catch {
            await this.install()
        }

        this.config = new Components.Config(this._options.path)
        this.distillerDB = new Components.DistillerDB(this)
        this.blocklist = new Components.Blocklist(this);
        this.encoder = new Components.EncoderService(this);
        this.accounts = new Components.AccountSystem(this);
        await this.accounts.start();
        this.log = Components.Logger(this._options.path)
        await this.config.open()
        this.start_progress.message = "Starting IPFS";
        await Components.ipfsHandler.start(this._options.path);
        
        //await Components.ipfsHandler.ready;
        var {ipfs} = await Components.ipfsHandler.getIpfs();
        this.ipfs = ipfs;
        try {
            var peerInfo = await this.ipfs.id()
            this.log.info(`IPFS operational with PeerID of ${peerInfo.id}`)
        } catch (ex) {
            this.log.error(ex)
        }
        this.pins = new Components.Pins(this)
        await this.pins.start()
        this.events.emit("ready")
        this.start_progress.ready = true;
        this.start_progress.message = null;
        setInterval(async() => {
            for(const peerId of await this.ipfs.config.get("Bootstrap")) {
                try {
                    await this.ipfs.swarm.connect(peerId)
                } catch {

                }
            }
        }, 60000)
    }
    async stop(options = {}) {
        if(options.background !== true) {
            await Components.ipfsHandler.stop(this._options.path);
        }
        await this.pins.stop()
        this.log.info(`App shutting down`)
    }
}
export default Core;