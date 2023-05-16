import { CID, globSource, IPFSHTTPClient } from 'ipfs-http-client'
import PouchDB from 'pouchdb'
import Axios from 'axios'
import fs from 'fs'
import fsPromises from 'fs/promises'
import { CoreService } from '..'
import RefLink from '../../RefLink'
import { IpfsHandler } from './ipfsHandler'
import tmp from 'tmp'
import execa from 'execa'
import waIpfs from 'wa-go-ipfs'
const Path = require('path')
const debug = require('debug')('3speak:pins')
const Schedule = require('node-schedule')
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))

async function progressPin(ipfs: IPFSHTTPClient, pin: string, callback: Function) {

  // ipfs.dag.exp
  
  const tmpPath = tmp.dirSync();
  console.log(tmpPath)
  const writer = fs.createWriteStream(Path.join(tmpPath.name, 'download.car'));

  const {data} = await Axios.get(`https://ipfs-3speak.b-cdn.net/api/v0/object/stat?arg=${pin}`)
  const CumulativeSize = data.CumulativeSize

  let totalSizeSoFar = 0;
  await Axios.get(`https://ipfs-3speak.b-cdn.net/api/v0/dag/export?arg=${pin}`, {
    responseType: 'stream',
  }).then(response => {

    
    response.data.on('data', (chunk) => {
      totalSizeSoFar = totalSizeSoFar + chunk.length
      const pct = Math.round((totalSizeSoFar / CumulativeSize) * 100)
      callback(pct)
      // console.log(`${pct}%`)
    })
    return new Promise((resolve, reject) => {
      response.data.pipe(writer);
      let error = null;
      writer.on('error', err => {
        error = err;
        writer.close();
        reject(err);
      });
      writer.on('close', () => {
        if (!error) {
          resolve(true);
        }
      });
    });
  })
  
  // console.log('got here')
  // for await(let importBlock of ipfs.dag.import(fs.createReadStream(Path.join(tmpPath.name, 'download.car')))) {
  //   console.log(importBlock)
  // }

  const ipfsInfo = await IpfsHandler.getIpfs()
  const ipfsPath = await waIpfs.getPath(
    waIpfs.getDefaultPath({ dev: process.env.NODE_ENV === 'development' }),
  )


  const output = await execa(ipfsPath, [
    'dag',
    'import',
    Path.join(tmpPath.name, 'download.car')
  ], {
    env: {
      IPFS_PATH: ipfsInfo.ipfsPath
    }
  })
  console.log(output)
  
  await fsPromises.rmdir(tmpPath.name, {
    recursive: true,
    force: true
  } as any)

  // const refs = ipfs.refs(pin, {
  //   recursive: true
  //   // maxDepth: 1
  // })
  // const TotalSize = (await ipfs.object.stat(CID.parse(pin))).CumulativeSize
  // let counter = 0
  // for await(let result of refs) {
  //   // const CumulativeSize = (await ipfs.object.stat(CID.parse(result.ref))).CumulativeSize
  //   const dag = await ipfs.dag.get(CID.parse(result.ref))
  //   counter = counter + dag.value.Data.length;
  //   callback(Number((counter / TotalSize).toFixed(3)))
  // }
}
class Pins {
  self: CoreService
  db: any
  inProgressPins: {}
  constructor(self) {
    this.self = self
    this.db = new PouchDB(Path.join(this.self._options.path, 'pins'))
    this.clean = this.clean.bind(this)
    this.inProgressPins = {}
  }
  async ls(selector = {}) {
    const out = []
    out.push(...Object.values(this.inProgressPins))
    out.push(
      ...(
        await this.db.find({
          selector,
        })
      ).docs,
    )
    return out
  }
  async add(doc) {
    debug(`received add with id of ${doc._id}`)
    if (typeof doc !== 'object') {
      throw new Error('First argument must be type of object.')
    }
    if (!doc.expire) {
      doc.expire = null
    }
    const { ipfs } = await IpfsHandler.getIpfs()

    ;(await ipfs.config.get('Bootstrap')).forEach(async (bt) => {
      try {
        await ipfs.swarm.connect(bt)
      } catch (ex) {
        // console.error(ex)
      }
    })
    doc.cids = doc.cids.filter(function (item, pos, self) {
      return self.indexOf(item) == pos
    })
    doc.size = 0
    this.inProgressPins[doc._id] = doc


    let totalSize = 0
    let totalPercent;

    console.log(doc)

    const progressTick = setInterval(async() => {

      try {
        const bDoc = await this.db.get("hive:cowboyzlegend27:qauvdrmx")
        console.log(bDoc)
      } catch {

      }
      try {
        const cDoc = await this.db.get(doc._id)
        console.log(cDoc)
      } catch {

      }
      await this.db.upsert(doc._id, (oldDoc) => {
        console.log('change status', oldDoc, totalPercent)
        oldDoc.percent = totalPercent;
        doc.percent = totalPercent
        return oldDoc
      })
    }, 1000)

    for (const cid of doc.cids) {
      console.log('Pinning CID', cid, new Date(), doc._id)
      await progressPin(this.self.ipfs, cid, (percent) => {
        totalPercent = percent
      })
      console.log('Done pinning, attempting full pin')
      await this.self.ipfs.pin.add(cid)
      console.log('Getting Cumulative size of', cid, new Date(), doc._id)
      const objectInfo = await this.self.ipfs.object.stat(cid)
      totalSize = totalSize + objectInfo.CumulativeSize
    }
    clearInterval(progressTick)
    doc.size = totalSize
    //Prevet old and new docs from stepping on eachother.
    await this.db.upsert(doc._id, (oldDoc) => {
      if (
        (oldDoc.expire < doc.expire && oldDoc.expire) ||
        doc.expire === null ||
        typeof oldDoc.expire === 'undefined'
      ) {
        if (!doc.meta.pin_date) {
          doc.meta.pin_date = new Date().getTime()
        }
        return doc
      } else {
        return oldDoc
      }
    })
    delete this.inProgressPins[doc._id]
  }
  async rm(reflink) {
    const doc = await this.db.get(reflink)
    try {
      await this.self.ipfs.pin.rm(doc.cids)
    } catch {} //If not pinned locally

    doc._deleted = true
    await this.db.put(doc)
  }
  /**
   * Removes unneccessary cached ipf data
   */
  async clean() {
    const currentTS = new Date().getTime()
    const pinsToDestroy = (
      await this.db.find({
        selector: {
          expire: {
            $lte: currentTS,
            $type: 'number',
          },
        },
      })
    ).docs
    debug(`Cycle pin removal ${JSON.stringify(pinsToDestroy)}`)
    this.self.logger.verbose(`Cycle pin removal ${JSON.stringify(pinsToDestroy)}`)
    for (const pin of pinsToDestroy) {
      try {
        await this.self.ipfs.pin.rm(pin.cids)
      } catch (err) {
        this.self.logger.error(`Error removing pins!`, err)
      } //If not pinned locally
      pin._deleted = true
      await this.db.put(pin)
    }
  }
  /**
   * IPFS garbage collection
   * @returns {Promise<null>}
   */
  async gc() {
    this.self.events.emit('pins.gc_started')
    await this.self.ipfs.repo.gc()
    this.self.events.emit('pins.gc_complete')
  }
  async start() {
    Schedule.scheduleJob('pins.clean', '*/15 * * * *', this.clean)
  }
  async stop() {
    Schedule.cancelJob('pins.clean')
  }
}
export default Pins
