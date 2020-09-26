import RefLink from '../../RefLink';
import PouchDB from 'pouchdb'
import pQueue from 'p-queue'
const debug = require('debug')("blasio:distiller")
const Path = require('path');
const { Client: HiveClient } = require('@hiveio/dhive')
PouchDB.plugin(require('pouchdb-find'));

const hiveClient = new HiveClient('https://anyx.io')
const hive = require('@hiveio/hive-js');
hiveClient.timeout = 5000

const queue = new pQueue({
    concurrency: 1
});

/**
 * DistillerDB is a component meant for storing, and handling post object data.
 * Primarily to provide a secondary abstraction between the user interface <--> content source medium.
 * Content source medium can be an account system, website, platform, blockchain, decentralized database or other simiar system.
 * @todo Implement multi source medium system specs.
 * @todo Implement limits above 100 imposed by dsteem, and API.
 * @todo Implement looping cycle deletion worker for data still cached after 30 days.
 * @todo Implement integration with blocklist system.
 */
class DistillerDB {
    constructor(self) {
        this.self = self;

        this.pouch = new PouchDB(Path.join(this.self._options.path, "distiller.db"));

        this._options = {
            defaultExpireTime: (15 * 60 * 1000), //Fifteen minutes
            defaultDeletionTime: (30 * 24 * 60 * 60 * 1000) //Time to delete unneccessary post data. Default 30 days
        }
    }
    /**
     * Internal database deletion. Primarily used for testing at the moment.
     */
    async drop() {
        await this.pouch.destroy()
    }
    /**
     * Internal fetch handler
     * @param {String} permalink 
     */
    async _fetch(permalink) {
        debug(`Fetching permalink "${permalink}" from fresh source`);
        const splitted = permalink.split(":");
        const sourceSystem = splitted[0];
        const author = splitted[1];
        const id = splitted[2];

        let json_content;
        switch (sourceSystem) {
            case "hive": {
                if (id) {
                    var out = await new Promise((resolve, reject) => {
                        hiveClient.database.call('get_content', [author, id]).then((err, ret) => {
                            if (err) return reject(err);
                            return resolve(ret);
                        })
                    });
                    /*var out = (await hiveClient.database.getDiscussions("blog", {
                        tag: author,
                        limit: 1,
                        start_author: author,
                        start_permlink: id
                    }))[0];*/
                    if(out) {
                        try {
                            out.json_metadata = JSON.parse(out.json_metadata)
                        } catch {
                            
                        }
                    }
                    return out;
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
        }
    }
    /**
     * Processes the insertion of a list of posts.
     * Can be original posts, or child posts.
     * @todo Add support for async iterables. (Future item)
     * @param {[]} posts iterable/array of the data to insert
     */
    async *_processPostsInsertion(posts) {
        for (var post of posts) {

            let reflink;
            if (post.author && post.permlink) {
                reflink = RefLink.parse(`hive:${post.author}:${post.permlink}`)
            } else if (post.reflink) {
                reflink = RefLink.parse(post.reflink);
            } else {
                throw new Error("Invalid post data")
            }

            yield { post, reflink: reflink.toString() };

            if (typeof post.json_metadata === "string") {
                post.json_metadata = JSON.parse(post.json_metadata);
            }
            try {
                const dbPost = await this.pouch.get(reflink.toString());
                if (dbPost.expire < (new Date() / 1)) {
                    dbPost.json_content = post;
                    dbPost.expire = (new Date() / 1) + this._options.defaultExpireTime;
                    //await this.pouch.put(dbPost);
                }
            } catch {
                await this.pouch.put({
                    _id: reflink.toString(),
                    json_content: post,
                    expire: (new Date() / 1) + this._options.defaultExpireTime,
                    type: "post"
                })
            }
        }
    }
    /**
     * Retrieves children of a content root.
     * @param {String|RefLink} reflink 
     * @param {*} options 
     * @todo implement recursive child updating
     */
    async getChildren(reflink, options = {}) {
        if (!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink);
        }
        if (!options.limit) {
            options.limit = 25;
        }
        if (!options.query) {
            options.query = {};
        }
        if (!options.asPost) {
            options.asPost = true;
        }
        if (!options.stateBased) {
            /**
             * State based uses a state record to provide a relational structure for children.
             * Disabling will force searches of the pouchdb caching database.
             * Not implemented currently.
             */
            options.stateBased = true;
        }

        let record;
        try {
            record = await this.pouch.get(`child/${reflink.toString()}`);
        } catch {
            //Do nothing
        }

        let childState = [];
        if (!record) {
            var children = await new Promise((resolve, reject) => {
                hive.api.getContentReplies(reflink.root, reflink.permlink, (err, ret) => {
                    if (err) return reject(err);
                    return resolve(ret);
                })
            });
            try {
                for await (const result of this._processPostsInsertion(children)) {
                    childState.push(result.reflink.toString())
                }
            } catch {

            }
            /**
             * Set child state object.
             * This is used to track the child state of a particular post.
             * If a post child is removed (for any abstract reason) it will be instantly modified. 
             */
            await queue.add(async () => await this.pouch.put({
                _id: `child/${reflink.toString()}`,
                json_content: childState,
                expire: (new Date() / 1) + this._options.defaultExpireTime,
                type: "state.child",
            }));
        } else {
            if ((new Date() / 1) < record.expire) {
                //Record is not expired.
                childState = record.json_content;
            } else {
                //Record is expired.
                var children = await new Promise((resolve, reject) => {
                    hive.api.getContentReplies(reflink.root, reflink.permlink, (err, ret) => {
                        if (err) return reject(err);
                        return resolve(ret);
                    })
                });
                for await (const result of this._processPostsInsertion(children)) {
                    childState.push(result.reflink.toString())
                }
                await queue.add(async () => await this.pouch.put({
                    _id: `child/${reflink}`,
                    _rev: record._rev,
                    json_content: childState,
                    expire: (new Date() / 1) + this._options.defaultExpireTime,
                    type: "state.child"
                }));
            }
        }

        let out = [];
        /**
         * Loop fetch each post in child state individually.
         */
        for (const t of childState) {
            if (options.asPost) {
                out.push(await this.getContent(t));
            } else {
                out.push(t);
            }
        }


        return out;
    }
    /**
     * Retrieves content information
     * @param {String|RefLink} reflink 
     * @param {*} options 
     */
    async getContent(reflink, options = {}) {
        if (!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink);
        }
        //var record = await this._get(new Key(permalink));
        let record;
        try {
            record = await this.pouch.get(reflink.toString());
        } catch (ex) {
            record = {};
        }

        //console.log(record);
        if (record) {
            if ((new Date() / 1) < record.expire) {
                return record;
            } else {
                debug(`Post "${reflink}" is expired or missing. Fetching recent version...`);
                try {
                    var json_content = await this._fetch(reflink.toString());
                    let toStore = {
                        _id: reflink.toString(),
                        json_content,
                        expire: (new Date() / 1) + this._options.defaultExpireTime,
                        type: "post"
                    }
                    if (record._rev) {
                        toStore._rev = record._rev;
                    }
                    await queue.add(async () => await this.pouch.put(toStore));
                    return toStore;
                } catch (ex) {
                    console.log(ex);
                    if (record.json_content) {
                        return record;
                    } else {
                        throw new Error("Failed to retrieve post information. (Not in database or available on the internet)");
                    }
                }
            }
        } else {
            
        }
    }
    /**
     * Retrieves state information such as trending, recent content, following content, etc.
     * @param {String|RefLink} reflink 
     * @param {*} options 
     */
    async getState(state, options) {
        switch (state) {
            case "following": {

            }
        }
    }
    /**
     * Get tag state.
     * @todo Implement handling for limits above 100 imposed by certain APIs.
     * @param {RefLink|String} tag 
     * @param {{limit:Number, query:Object, asPost: Boolean} options
     */
    async getTag(tag, options = {}) {
        if (!options.limit) {
            options.limit = 25;
        }
        if (!options.query) {
            options.query = {};
        }
        if (!options.query) {
            options.asPost = true;
        }

        let record;
        try {
            record = await this.pouch.get(`tag/${tag}`);
        } catch {
            //Do nothing
        }

        let tagState = [];
        if (!record) {
            var posts = (await hiveClient.database.getDiscussions("created", {
                limit: options.limit,
                tag
            }));
            for await (const result of this._processPostsInsertion(posts)) {
                tagState.push(result.reflink.toString())
            }
            await queue.add(async () => await this.pouch.put({
                _id: `tag/${tag}`,
                json_content: tagState,
                expire: (new Date() / 1) + this._options.defaultExpireTime,
                type: "state.tag"
            }));
        } else {
            if ((new Date() / 1) < record.expire) {
                //Record is not expired.
                tagState = record.json_content;
            } else {
                //Record is expired.
                var posts = (await hiveClient.database.getDiscussions("created", {
                    limit: options.limit,
                    tag
                }));
                for await (const result of this._processPostsInsertion(posts)) {
                    tagState.push(result.reflink.toString())
                }
                await queue.add(async () => await this.pouch.put({
                    _id: `tag/${tag}`,
                    _rev: record._rev,
                    json_content: tagState,
                    expire: (new Date() / 1) + this._options.defaultExpireTime,
                    type: "state.tag"
                }));
            }
        }

        let out = [];
        /**
         * Loop fetch each post in tag individually.
         */
        for (const t of tagState) {
            if (options.asPost) {
                out.push(await this.getContent(t))
            } else {
                out.push(t)
            }
        }

        return out;
    }

    /**
     * Retrieves posts from a specified author
     * @param {String|Reflink} reflink 
     * @param {{limit:Number, query:Object, asPosts:Boolean}} options
     */
    async getPosts(reflink, options = {}) {
        if (!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink);
        }
        if (!options.limit) {
            options.limit = 10;
        }
        if (!options.query) {
            options.query = {};
        }
        if (!options.asPosts) {
            options.asPosts = true;
        }

        let stateRecord;
        try {
            stateRecord = await this.pouch.get(reflink.toString());
        } catch {
            //Do nothing
        }

        let out = [];
        let latestState;
        if (!stateRecord) {
            latestState = await hiveClient.database.getDiscussions("blog", {
                tag: reflink.root,
                limit: options.limit
            });
            await queue.add(async () => await this.pouch.put({
                _id: reflink.toString(),
                posts: latestState,
                expire: new Date() / 1 + this._options.defaultExpireTime,
                type: "account"
            }));
        } else {
            if (stateRecord.expire > (new Date / 1) && !stateRecord.posts) {
                latestState = await hiveClient.database.getDiscussions("blog", {
                    tag: reflink.root,
                    limit: options.limit
                });
                stateRecord.posts = latestState;
                await queue.add(async () => await this.pouch.put(stateRecord));
            } else {
                latestState = stateRecord.posts;
            }
        }
        for await (const result of this._processPostsInsertion(latestState)) {
            if (options.asPosts) {
                out.push(result.post);
            } else {
                out.push(result.reflink);
            }
        }
        return out;
    }
    /**
     * Retrieves account information.
     * @param {String|RefLink} reflink 
     * @param {*} options 
     */
    async getAccount(reflink, options = {}) {
        if (!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink);
        }

        let accountRecord;
        try {
            accountRecord = await queue.add(async () => await this.pouch.get(reflink.toString()));
        } catch {

        }

        if (accountRecord) {
            if (accountRecord.expire < (new Date() / 1) || !accountRecord.json_content) {
                var account = (await hiveClient.database.getAccounts([reflink.root]))[0];
                accountRecord.json_content = account;
                accountRecord.expire = new Date() / 1 + this._options.defaultExpireTime;
                await queue.add(async () => await this.pouch.put(accountRecord));
                return await this.pouch.get(reflink.toString());
            } else {
                return accountRecord
            }
        } else {
            var account = await hiveClient.database.getAccounts([reflink.root])[0];
            await queue.add(async () => await this.pouch.put({
                _id: reflink.toString(),
                json_content: account,
                expire: new Date() / 1 + this._options.defaultExpireTime,
                type: "account"
            }));
            return await this.pouch.get(reflink.toString())
        }
    }
    /**
     * Retrieves follower count.
     * @param {String|RefLink} reflink
     */
    async getFollowerCount(reflink) {
        if (!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink);
        }
        let followerCount = (await hiveClient.call(
            'follow_api',
            'get_follow_count',
            {account: reflink.root})).follower_count

        return followerCount
    }
}
export default DistillerDB;