import PouchDB from 'pouchdb'
import RefLink from '../../RefLink'
import IpfsHandler from './ipfsHandler'
const Path = require('path');
const debug = require('debug')('3speak:pins')
const Schedule = require('node-schedule')
PouchDB.plugin(require('pouchdb-find'));
PouchDB.plugin(require('pouchdb-upsert'));
class Pins {
    self: any;
	db: any;
	inProgressPins: {};
    constructor(self) {
        this.self = self;
        this.db = new PouchDB(Path.join(this.self._options.path, "pins"))
        this.clean = this.clean.bind(this);
        this.inProgressPins = {};
    }
    async ls(selector = {}) {
        var out = [];
        out.push(...Object.values(this.inProgressPins));
        out.push(...((await this.db.find({
            selector
        })).docs));
        return out;
    }
    async add(doc) {
        debug(`received add with id of ${doc._id}`)
        if (typeof doc !== "object") {
            throw new Error("First argument must be type of object.")
        }
        if (!doc.expire) {
            doc.expire = null;
        }
        var {ipfs} = await IpfsHandler.getIpfs();

        (await ipfs.config.get("Bootstrap")).forEach(async (bt) => {
            try {
                await ipfs.swarm.connect(bt)
            } catch (ex) {
                console.log(ex)
            }
        });
        doc.cids = doc.cids.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        })
        console.log(doc.cids)
        doc.size = 0;
        this.inProgressPins[doc._id] = doc;
        var totalSize = 0;
        for (var cid of doc.cids) {
            await this.self.ipfs.pin.add(cid);
            var objectInfo = await this.self.ipfs.object.stat(cid);
            totalSize = + objectInfo.CumulativeSize
        }
        doc.size = totalSize;
        //Prevet old and new docs from stepping on eachother.
        await this.db.upsert(doc._id, (oldDoc) => {
            if((oldDoc.expire < doc.expire && oldDoc.expire) || doc.expire === null || typeof oldDoc.expire === "undefined") {
                if(!doc.meta.pin_date) {
                    doc.meta.pin_date = new Date().getTime();
                }
                return doc;
            } else {
                return oldDoc;
            }
        })
        delete this.inProgressPins[doc._id];
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
        const currentTS = new Date().getTime()
        var pinsToDestroy = (await this.db.find({
            selector: {
                expire: {
                    $lte: currentTS,
                    $type: "number"
                }
            }
        })).docs;
        debug(`Cycle pin removal ${JSON.stringify(pinsToDestroy)}`)
        this.self.log.verbose(`Cycle pin removal ${JSON.stringify(pinsToDestroy)}`)
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