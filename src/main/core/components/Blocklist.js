const Path = require('path')
const PouchDB = require('pouchdb');
const RefLink = require('../../RefLink').default
PouchDB.plugin(require('pouchdb-find'));

/**
 * A simple interface to hide/block content from a certain author, a particular permalink or metadata tag.
 * (Wrapper datastore-level)
 */
class Blocklist {
    constructor(self) {
        this.self = self;

        this.pouch = new PouchDB(Path.join(this.self._options.path, "blocklist.db"));
    }
    async add(reflink, options = {}) {
        try {
            await this.pouch.put({
                _id: reflink.toString(),
                reason: options.reason,
                ts: new Date() / 1,
                source: "manual"
            })
        } catch (ex) {
            console.log(ex)
            throw new Error("Reflink already in blocklist");
        }
    }
    async rm(reflink) {
        await this.pouch.remove(reflink.toString());
    }
    /**
     * 
     * @param {String|RefLink} reflink 
     */
    async has(reflink) {
        if (!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink);
        }
        if(!this.self.config.get("blocklist.enabled")) {
            return false;
        }
        try {
            await this.pouch.get(reflink.toString());
            return true;
        } catch {}
        try {
            await this.pouch.get(`${reflink.source.value}:${reflink.root}`)
            return true;
        } catch {}
        return false;
    }
    async ls(query = {}) {
        query._deleted = {
            $exists: false
        }
        return (await this.pouch.find({
            selector: query
        })).docs
    }
    async start() {
        
    }
}
module.exports = Blocklist;