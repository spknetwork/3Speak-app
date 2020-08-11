const Utils = require('./utils');
const Components = require('./components');
const fs = require('fs');
const mergeOptions = require('merge-options')

class Core {
    constructor(options) {
        const defaults = {
            path: Utils.getRepoPath()
        };
        this._options = mergeOptions(defaults, options);
    }
    
    async start() {
        if(!fs.existsSync(this._options.path)) {
            fs.mkdirSync(this._options.path);
        }
        this.config = new Components.Config(this._options.path)
        this.distillerDB = new Components.DistillerDB(this)
        this.blocklist = new Components.Blocklist(this);
        await this.config.open()
    }
    async stop() {

    }
}
module.exports = Core;