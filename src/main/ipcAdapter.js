const PromiseIPC = require('electron-promise-ipc')
/**
 * Section of code to translate IPC promise calls to and from renderer and main prcoess/core bundle.
 */
class ipcAdapter {
    constructor(core) {
        this.core = core;
    }
    start() {
        //distillerDb
        PromiseIPC.on("distiller.getTag", async (tag, options) => {
            return await this.core.distillerDB.getTag(tag, options);
        })
        PromiseIPC.on("distiller.getContent", async (reflink, options) => {
            return await this.core.distillerDB.getContent(reflink, options);
        })
        PromiseIPC.on("distiller.getPosts", async (reflink, options) => {
            return await this.core.distillerDB.getPosts(reflink, options);
        })
        PromiseIPC.on("distiller.getChildren", async (reflink, options) => {
            return await this.core.distillerDB.getChildren(reflink, options);
        })
        PromiseIPC.on("distiller.getAccount", async (reflink, options) => {
            return await this.core.distillerDB.getAccount(reflink, options);
        })
        PromiseIPC.on("distiller.getState", async (stateKey) => {
            return await this.core.distillerDB.getState(stateKey);
        })
        PromiseIPC.on("distiller.getFollowerCount", async (reflink) => {
            return await this.core.distillerDB.getFollowerCount(reflink)
        })
        //Blocklist
        PromiseIPC.on("blocklist.add", async (reflink, options) => {
            return await this.core.blocklist.add(reflink, options);
        })
        PromiseIPC.on("blocklist.has", async (reflink) => {
            return await this.core.blocklist.has(reflink);
        })
        PromiseIPC.on("blocklist.rm", async (reflink) => {
            return await this.core.blocklist.rm(reflink);
        })
        PromiseIPC.on("blocklist.ls", async (query) => {
            return await this.core.blocklist.ls(query);
        })
        //Core
        PromiseIPC.on("core.install", async () => {
            return await this.core.install()
        })
        PromiseIPC.on("core.status", async () => {
            return await this.core.status();
        })
        PromiseIPC.on("core.ready", async () => {
            return await this.core.ready();
        })
        //Pins
        PromiseIPC.on("pins.add", async (doc) => {
            return await this.core.pins.add(doc);
        })
        PromiseIPC.on("pins.rm", async (ref) => {
            return await this.core.pins.rm(ref);
        })
        PromiseIPC.on("pins.ls", async () => {
            return await this.core.pins.ls();
        })
    }
}
export default ipcAdapter;