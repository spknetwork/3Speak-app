import PouchDB from 'pouchdb'
import RefLink from '../../RefLink'
const Path = require('path')
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))

/**
 * A simple interface to hide/block content from a certain author, a particular permalink or metadata tag.
 * (Wrapper datastore-level)
 */
class Blocklist {
  pouch: any
  self: any
  constructor(self) {
    this.self = self

    this.pouch = new PouchDB(Path.join(this.self._options.path, 'blocklist.db'))
  }
  async add(reflink, options = {} as any) {
    try {
      await this.pouch.put({
        _id: reflink.toString(),
        reason: options.reason,
        ts: new Date().getTime(),
        source: 'manual',
      })
    } catch (ex) {
      console.error(ex)
      throw new Error('Reflink already in blocklist')
    }
  }
  async rm(reflink) {
    await this.pouch.upsert(reflink.toString(), (doc) => {
      doc._deleted = true
      return doc
    })
  }
  /**
   *
   * @param {String|RefLink} reflink
   */
  async has(reflink) {
    if (!(reflink instanceof RefLink)) {
      reflink = RefLink.parse(reflink)
    }
    if (!this.self.config.get('blocklist.enabled')) {
      return false
    }
    try {
      await this.pouch.get(reflink.toString())
      return true
    } catch {}
    try {
      await this.pouch.get(`${reflink.source.value}:${reflink.root}`)
      return true
    } catch {}
    return false
  }
  async ls(query = {} as any) {
    query._deleted = {
      $exists: false,
    }
    return (
      await this.pouch.find({
        selector: query,
      })
    ).docs
  }
  async start() {}
}
export default Blocklist
