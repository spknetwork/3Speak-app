import { api, broadcast } from "@hiveio/hive-js"
import PromiseIPC from 'electron-promise-ipc'
import ArraySearch from 'arraysearch'

const Finder = ArraySearch.Finder

type UpdateAccountOperation = [[
  'account_update2',
  {
    account: string;
    json_metadata: string;
    posting_json_metadata: string;
  }
]]

interface Profile {
  posting_json_metadata: string;
  json_metadata: string;
}

const fetchSingleProfile = async (account: string): Promise<Profile> => {
  const params = [[account]]
  try {
    const data = await api.callAsync('condenser_api.get_accounts', params)
    return data[0]
  } catch (err) {
    console.error(err.message)
    throw err
  }
}

const generateUpdateAccountOperation = (account: string, posting_json_metadata: string, json_metadata = ''): Promise<UpdateAccountOperation> => {
  return new Promise((resolve) => {
    const op_comment: UpdateAccountOperation = [[
      'account_update2',
      {
        account,
        json_metadata,
        posting_json_metadata,
      },
    ]]
    resolve(op_comment)
  })
}

export const handleUpdatePostingData = async (peerId: string): Promise<void> => {
  const profileID = window.localStorage.getItem('SNProfileID')
  const getAccount = (await PromiseIPC.send('accounts.get', profileID as any)) as any
  const hiveInfo = Finder.one.in(getAccount.keyring).with({ type: 'hive' })
  const wif = hiveInfo.privateKeys.posting_key
  const postingData = JSON.parse((await fetchSingleProfile(getAccount.nickname)).posting_json_metadata)
  postingData['peerId'] = peerId
  const stringifiedPostingData = JSON.stringify(postingData)

  const operations = await generateUpdateAccountOperation(getAccount.nickname, stringifiedPostingData)

  console.log('type of peerId', typeof peerId)
  console.log(peerId)
  console.log(operations[0])

  broadcast.send(
    { operations: [operations[0]] },
    { posting: wif },
    (err: Error, result: any) => {
      if (err) {
        console.error('Error broadcasting operation:', err.message)
      } else {
        console.log('Operation broadcast successfully:', result)
      }
    }
  )
}