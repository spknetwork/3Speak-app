import PromiseIPC from 'electron-promise-ipc'
import { hiveClient } from '../../singletons/hive-client.singleton'
import ArraySearch from 'arraysearch'
//Get account posting_json_metadata
export async function getAccountMetadata() {
  const Finder = ArraySearch.Finder
  const profileID = window.localStorage.getItem('SNProfileID')
  const getAccount = (await PromiseIPC.send('accounts.get', profileID as any)) as any
  const hiveInfo = Finder.one.in(getAccount.keyring).with({ type: 'hive' })

  const account = await hiveClient.call('condenser_api', 'get_accounts', [[hiveInfo.username]])
  const metadata = account[0].posting_json_metadata
  return metadata
}