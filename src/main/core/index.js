import Components from './components';
const EventEmitter = require('events')
const Utils = require('./utils');
const fs = require('fs');
const mergeOptions = require('merge-options')

class Core {
    constructor(options) {
        const defaults = {
            path: Utils.getRepoPath()
        };
        this._options = mergeOptions(defaults, options);
        this.events = new EventEmitter();
    }
    
    async start() {
        if(!fs.existsSync(this._options.path)) {
            fs.mkdirSync(this._options.path);
        }
        this.config = new Components.Config(this._options.path)
        this.distillerDB = new Components.DistillerDB(this)
        this.blocklist = new Components.Blocklist(this);
        await this.config.open()
        await Components.ipfsHandler.start(this._options.path);
        await Components.ipfsHandler.ready;
        var {ipfs} = await Components.ipfsHandler.getIpfs();
        this.ipfs = ipfs;
        this.pins = new Components.Pins(this)
        this.pins.start()
    }
    async stop() {
        await Components.ipfsHandler.stop(this._options.path);
    }
}
export default Core;