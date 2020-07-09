const PromiseIPC = require('electron-promise-ipc')
/**
 * Section of code to translate IPC promise calls to and from renderer and main prcoess/core bundle.
 */
class ipcAdapter {
    constructor(core) {
        this.core = core;
    }
    start() {
        PromiseIPC.on("genuine.fetch", async (permalink) => {
            return await this.core.GenuineDB.fetch(permalink)
        })
    }
}
module.exports = ipcAdapter;