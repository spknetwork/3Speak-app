const datastoreLevel = require('datastore-level');
const { Key } = require('interface-datastore');
const DagCbor = require('ipld-dag-cbor');
const debug = require('debug')("blasio:postdb")
const Path = require('path');
const compressjs = require('compressjs')
const {Client:HiveClient} = require('dsteem')
 
const hiveClient = new HiveClient('https://hive.3speak.online/')

class GenuineDB {
    constructor(self) {
        this.self = self;

        this.db = new datastoreLevel(Path.join(this.self._options.path, "genuinedb"));

        this._options = {
            defaultExpireTime: (15 * 60 * 1000), //Fifteen minutes
            defaultDeletionTime: (30 * 24 * 60 * 60 * 1000) //Time to delete unneccessary post data. Default 30 days
        }
    }
    /**
     * JSON wrapper for levelstore
     * @param {Key} permalink 
     */
    async _get(permalink) {
        if((await this.db.has(permalink)))
            return DagCbor.util.deserialize(compressjs.Bzip2.decompressFile(await this.db.get(permalink)))
        else 
            return {}
    }
    /**
     * JSON wrapper for levelstore
     * @param {Key} permalink 
     * @param {Object} json_content 
     */
    async _put(permalink, input) {
        return await this.db.put(permalink, compressjs.Bzip2.compressFile(DagCbor.util.serialize(input)))
    }
    /**
     * Internal fetch handler
     * @param {String} permalink 
     */
    async _fetch(permalink) {
        debug(`Fetching permalink "${permalink}" from fresh source`);
        const splitted = permalink.split("/");
        const sourceSystem = splitted[0];
        const author = splitted[1];
        const id = splitted[2];

        let json_content;
        switch(sourceSystem) {
            case "hive": {
                if(id) {
                    return (await hiveClient.database.getDiscussions("blog", {
                        tag: author,
                        limit: 1,
                        start_author: author,
                        start_permlink: id
                    }))[0];
                } else {
                    return (await hiveClient.database.getAccounts([author]))[0];
                }
                break;
            }
            case "orbitdb": {
                //Ideally fire up an orbitdb instance
                break;
            }
            default: {
                throw new Error("Unknown source system")
            }
            return json_content;
        }
    }
    /**
     * Fetches post from local database or internet
     * Caches post data locally, expires after a set period of time. 
     * When post data is expired node will fetch the latest data, unless device is offline. 
     * Where local copy will be used regardless.
     * @param {String} permalink
     * @param {{timeout: Number}} options
     */
    async fetch(permalink) {
        var record = await this._get(new Key(permalink));
        if(new Date() / 1 < record.expire) {
            return record;
        } else {
            debug(`Post "${permalink}" is expired or missing. Fetching recent version...`)
            try {
                var json_content = await this._fetch(permalink);
                let toStore = {
                    json_content,
                    expire: (new Date() / 1) + this._options.defaultExpireTime
                }
                await this._put(new Key(permalink), toStore)
                return toStore;
            } catch (ex) {
                console.log(ex)
                if(record.json_content) {
                    return record;
                } else {
                    throw new Error("Failed to retrieve post information. (Not in database or available on the internet)");
                }
            }
        }
    }
    /**
     * Retrieves children of a content root.
     * @param {String} reflink 
     * @param {*} options 
     */
    async getChildren(reflink, options) {
        
    }
    /**
     * Retrieves content information
     * @param {String} reflink 
     * @param {*} options 
     */
    async getContent(reflink, options) {

    }
    /**
     * Retrieves state information such as trending, recent content, following content, etc.
     * @param {String} reflink 
     * @param {*} options 
     */
    async getState(reflink, options) {

    }
    /**
     * Retrieves account information.
     * @param {String} reflink 
     * @param {*} options 
     */
    async getAccount(reflink, options) {

    }
}
module.exports = GenuineDB;