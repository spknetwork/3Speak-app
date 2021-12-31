import { CoreService } from './core'

const PromiseIPC = require('electron-promise-ipc')
/**
 * Section of code to translate IPC promise calls to and from renderer and main prcoess/core bundle.
 */
class IpcAdapter {
  core: CoreService
  constructor(core: CoreService) {
    this.core = core
  }
  start() {
    //distillerDb
    PromiseIPC.on('distiller.getTag', async (tag, options) => {
      return await this.core.distillerDB.getTag(tag, options)
    })
    PromiseIPC.on('distiller.getContent', async (reflink, options) => {
      return await this.core.distillerDB.getContent(reflink, options)
    })
    PromiseIPC.on('distiller.getPosts', async (reflink, options) => {
      return await this.core.distillerDB.getPosts(reflink, options)
    })
    PromiseIPC.on('distiller.getChildren', async (reflink, options) => {
      return await this.core.distillerDB.getChildren(reflink, options)
    })
    PromiseIPC.on('distiller.getAccount', async (reflink, options) => {
      return await this.core.distillerDB.getAccount(reflink, options)
    })
    PromiseIPC.on('distiller.getState', async (stateKey) => {
      return await this.core.distillerDB.getState(stateKey)
    })
    PromiseIPC.on('distiller.getFollowerCount', async (reflink) => {
      return await this.core.distillerDB.getFollowerCount(reflink)
    })
    //Blocklist
    PromiseIPC.on('blocklist.add', async (reflink, options) => {
      return await this.core.blocklist.add(reflink, options)
    })
    PromiseIPC.on('blocklist.has', async (reflink) => {
      return await this.core.blocklist.has(reflink)
    })
    PromiseIPC.on('blocklist.rm', async (reflink) => {
      return await this.core.blocklist.rm(reflink)
    })
    PromiseIPC.on('blocklist.ls', async (query) => {
      return await this.core.blocklist.ls(query)
    })
    //Core
    PromiseIPC.on('core.install', async () => {
      return await this.core.install()
    })
    PromiseIPC.on('core.status', async () => {
      return await this.core.status()
    })
    PromiseIPC.on('core.ready', async () => {
      return await this.core.ready()
    })
    //Encoder
    PromiseIPC.on('encoder.createJob', async (req_obj) => {
      return await this.core.encoder.createJob(req_obj)
    })
    PromiseIPC.on('encoder.status', async (id) => {
      return await this.core.encoder.status(id)
    })
    PromiseIPC.on('encoder.getjoboutput', async (id) => {
      return await this.core.encoder.getJobOutput(id)
    })
    PromiseIPC.on('encoder.ready', async () => {
      return await this.core.encoder.ready()
    })
    //Pins
    PromiseIPC.on('pins.add', async (doc) => {
      return await this.core.pins.add(doc)
    })
    PromiseIPC.on('pins.rm', async (ref) => {
      return await this.core.pins.rm(ref)
    })
    PromiseIPC.on('pins.ls', async () => {
      return await this.core.pins.ls()
    })
    //Accounts
    PromiseIPC.on('accounts.createProfile', async (doc) => {
      return await this.core.accounts.createProfile(doc)
    })
    PromiseIPC.on('accounts.deleteProfile', async (profileID) => {
      return await this.core.accounts.deleteProfile(profileID)
    })
    PromiseIPC.on('accounts.get', async (ref) => {
      return await this.core.accounts.get(ref)
    })
    PromiseIPC.on('accounts.has', async (ref) => {
      return await this.core.accounts.has(ref)
    })
    PromiseIPC.on('accounts.ls', async (obj) => {
      return await this.core.accounts.ls(obj)
    })
    PromiseIPC.on('accounts.addProfileKey', async (ref) => {
      return await this.core.accounts.addProfileKey(ref)
    })
    PromiseIPC.on('accounts.getProfileKey', async (ref) => {
      return await this.core.accounts.getProfileKey(ref)
    })
    PromiseIPC.on('accounts.deleteProfileKey', async (ref) => {
      return await this.core.accounts.deleteProfileKey(ref)
    })
    PromiseIPC.on('accounts.deleteProfile', async (ref) => {
      return await this.core.accounts.deleteProfile(ref)
    })
  }
}
export default IpcAdapter
