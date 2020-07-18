const PromiseIPC = require('electron-promise-ipc')
/**
 * Section of code to translate IPC promise calls to and from renderer and main prcoess/core bundle.
 */
class ipcAdapter {
    constructor(core) {
        this.core = core;
    }
    start() {
        PromiseIPC.on("distiller.fetch", async (reflink) => {
            return await this.core.DistillerDB.fetch(reflink);
        })
        PromiseIPC.on("distiller.getTag", async (tag, options) => {
            return await this.core.DistillerDB.getTag(tag, options);
        })
        PromiseIPC.on("distiller.getContent", async (reflink, options) => {
            return await this.core.DistillerDB.getContent(reflink, options);
        })
        PromiseIPC.on("distiller.getPosts", async (reflink, options) => {
            return await this.core.DistillerDB.getPosts(reflink, options);
        })
        PromiseIPC.on("distiller.getChildren", async (reflink, options) => {
            return await this.core.DistillerDB.getChildren(reflink, options);
        })
        PromiseIPC.on("distiller.getAccount", async (reflink, options) => {
            return await this.core.DistillerDB.getAccount(reflink, options);
        })
        PromiseIPC.on("distiller.getState", async (stateKey) => {
            return await this.core.DistillerDB.getState(stateKey);
        })
    }
}
module.exports = ipcAdapter;