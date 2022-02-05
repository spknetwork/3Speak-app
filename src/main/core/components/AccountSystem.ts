import PouchDB from 'pouchdb'
const { Finder } = require('arraysearch')
const Path = require('path')
PouchDB.plugin(require('pouchdb-find'))
PouchDB.plugin(require('pouchdb-upsert'))

const profile = {
  profileID: '12345',
  nickname: 'vaultec',
  keyring: [
    {
      type: 'hive',
      username: 'vaultec',
      public: {},
      encrypted: true,
      private: 'Encrypted blob', //Or object
    },
  ],
}
class AccountSystem {
  pouch: any
  self: any
  symmetricKeyCache: {}
  constructor(self) {
    this.self = self

    this.symmetricKeyCache = {}
  }
  async get(profileID, symmetricKey) {
    const profileInfo = await this.pouch.get(profileID)
    for (const key of profileInfo.keyring) {
      if (key.encrypted === true) {
        //Do decryption here...
        //throw new Error("Decryption is currently unavailable.")
      }
    }
    return profileInfo
  }
  async has(profileID) {
    try {
      await this.pouch.get(profileID)
      return true
    } catch (ex) {
      console.error(ex)
      return false
    }
  }
  async createProfile(profile) {
    if (!profile.keyring) {
      profile.keyring = []
    }
    return await this.pouch.post(profile)
  }
  async ls(options = {} as any) {
    if (!options.showPrivate) {
      options.showPrivate = false
    }
    if (!options.selector) {
      options.selector = {}
    }
    const accounts = (await this.pouch.find({ selector: options.selector })).docs
    if (options.showPrivate === false) {
      for (const account of accounts) {
        for (const key of account.keyring) {
          delete key.private
        }
      }
    }
    console.log(accounts)
    return accounts
  }
  async addProfileKey(profileID, key) {
    if (key.id) {
      throw new Error('key ID is required.')
    }
    await this.pouch.upsert(profileID, (doc) => {
      //if(Finder.one.in(doc.keyring).with({id:key.id})) {
      //}

      doc.keyring.push(key)
      return doc
    })
  }
  async deleteProfileKey(profileID, keyID) {
    this.pouch.upsert(profileID, (doc) => {
      // type error: secret not declared?
      //     doc.keyring.push(secret);
      doc.keyring.push(undefined)
      return doc
    })
  }
  async deleteProfile(profileID) {
    await this.pouch.upsert(profileID, (doc) => {
      doc._deleted = true
      return doc
    })
  }
  async setProfileInfo(profileID, opt) {
    await this.pouch.upsert(profileID, (doc) => {
      doc._deleted = true
      return doc
    })
  }
  async export(options = {}) {
    //Placeholder
  }
  async import(blob, options = {}) {
    //Placeholder
  }
  async start() {
    this.pouch = new PouchDB(Path.join(this.self._options.path, 'accountdb'))
  }
}
export default AccountSystem
