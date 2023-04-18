//Post Custom Json
import { api } from '@hiveio/hive-js'
import PromiseIPC from 'electron-promise-ipc'
import ArraySearch from 'arraysearch'
export async function updateMeta(username, metadata) {
  const Finder = ArraySearch.Finder
  console.log('Updating metadata')
  const profileID = window.localStorage.getItem('SNProfileID')
  const getAccount = (await PromiseIPC.send('accounts.get', profileID as any)) as any
  const hiveInfo = Finder.one.in(getAccount.keyring).with({ type: 'hive' })
  const wif = hiveInfo.privateKeys.posting_key
  console.log('WIF', wif)
  console.log('JSON METADATA', metadata)
  api.broadcast.account_update2(
    wif,
    [],
    [username],
    JSON.stringify(metadata),
    async (error, succeed) => {
      if (error) {
        console.error(error)
        console.error('Error encountered broadcsting custom json')
      }

      if (succeed) {
        console.log(succeed)
        console.log('success broadcasting custom json')
      }
    },
  )
}