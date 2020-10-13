import PouchDB from 'pouchdb'
import RefLink from '../../RefLink'
const Path = require('path');
const debug = require('debug')('blasio:pins')
const Schedule = require('node-schedule')
PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(require('pouchdb-upsert'));
class Pins {
    constructor(self) {
        this.self = self;
        this.db = new PouchDB(Path.join(this.self._options.path, "pins"))
        this.clean = this.clean.bind(this);
    }
    async ls(selector = {}) {
        return (await this.db.find({
            selector
        })).docs
    }
    async add(doc) {
        debug(`received add with id of ${doc._id}`)
        if (typeof doc !== "object") {
            throw new Error("First argument must be type of object.")
        }
        if (!doc.expire) {
            doc.expire = null;
        }
        var totalSize = 0;
        for (var cid of doc.cids) {
            await this.self.ipfs.pin.add(cid);
            var objectInfo = await this.self.ipfs.object.stat(cid);
            totalSize = + objectInfo.CumulativeSize
        }
        doc.size = totalSize;
        await this.db.upsert(doc._id, () => {
            return doc;
        })
    }
    async rm(reflink) {
        var doc = (await this.db.get(reflink))
        try {
            await this.self.ipfs.pin.rm(doc.cids)
        } catch { }; //If not pinned locally
        
        doc._deleted = true;
        await this.db.put(doc);
    }
    /**
     * Removes unneccessary cached ipf data
     */
    async clean() {
        const currentTS = new Date() / 1
        var pinsToDestroy = (await this.db.find({
            selector: {
                expire: {
                    $lte: currentTS,
                    $type: "number"
                }
            }
        })).docs;
        debug(`Cycle pin removal ${JSON.stringify(pinsToDestroy)}`)
        for (var pin of pinsToDestroy) {
            try {
                await this.self.ipfs.pin.rm(pin.cids)
            } catch { }; //If not pinned locally
            pin._deleted = true;
            await this.db.put(pin);
        }
    }
    /**
     * IPFS garbage collection
     * @returns {Promise<null>}
     */
    async gc() {
        this.self.events.emit("pins.gc_started")
        await this.self.ipfs.repo.gc();
        this.self.events.emit("pins.gc_complete")
    }
    async start() {
        Schedule.scheduleJob("pins.clean", "*/15 * * * *", this.clean);
    }
    async stop() {
        Schedule.cancelJob("pins.clean")
    }
}
export default Pins