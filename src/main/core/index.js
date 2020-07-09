const Utils = require('./utils');
const fs = require('fs');
const Components = require('./components');
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
        this.GenuineDB = new Components.GenuineDB(this)
    }
    async stop() {

    }
}
module.exports = Core;