import PouchDB from 'pouchdb'
import RefLink from '../../RefLink'
const Path = require('path');
const Schedule = require('node-schedule')
PouchDB.plugin(require('pouchdb-find'));
class Pins {
    constructor(self) {
        this.self = self;
        this.db = new PouchDB(Path.join(this.self._options.path, "pins"))
        this.clean = this.clean.bind(this);
    }
    async ls() {
        return (await this.db.find({
            selector: {}
        })).docs
    }3
    async add(doc) {
        if(typeof doc !== "object") {
            throw new Error("First argument must be type of object.")
        }
        if(!doc.expire) {
            doc.expire = null;
        }
        var totalSize = 0;
        for(var cid of doc.cids) {
            await this.self.ipfs.pin.add(cid);
            var objectInfo = await this.self.ipfs.object.stat(cid);
            totalSize =+ objectInfo.CumulativeSize
        }
        doc.size = totalSize;
        await this.db.put(doc);
    }
    async rm(reflink) {
        var doc = (await this.db.find({
            selector: {
                _id: reflink
            }
        }))
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
                    $gte: currentTS,
                    $type: "number"
                }
            }
        })).docs;
        console.log(`Cycle pin removal ${JSON.stringify(pinsToDestroy)}`)
        for(var pin of pinsToDestroy) {
            for await (var cid of this.self.ipfs.pin.rm(pin.cids)) {};
            pin._deleted = true;
            await this.db.put(pin);
        }
    }
    async start() {
        Schedule.scheduleJob("*/15 * * * *", this.clean);
    }
}
export default Pins