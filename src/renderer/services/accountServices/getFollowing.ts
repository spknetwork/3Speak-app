import PromiseIPC from 'electron-promise-ipc'
import { hiveClient } from '../../singletons/hive-client.singleton'
import ArraySearch from 'arraysearch'

export async function getFollowing() {
  const Finder = ArraySearch.Finder
  const profileID = window.localStorage.getItem('SNProfileID')
  // String does not match 2nd argument for send function signature
  const getAccount = (await PromiseIPC.send('accounts.get', profileID as any)) as any
  const hiveInfo = Finder.one.in(getAccount.keyring).with({ type: 'hive' })

  const out = []
  const done = false
  let nextFollow = ''
  const limit = 100
  while (done === false) {
    //       const followingChunk = await hiveClient.call('follow_api', 'get_following', [
    const followingChunk = await hiveClient.call('condenser_api', 'get_following', [
      hiveInfo.username,
      nextFollow,
      'blog',
      limit,
    ])

    out.push(...followingChunk)
    if (followingChunk.length !== limit) {
      break
    }
    nextFollow = followingChunk[followingChunk.length - 1].following
  }
  return out
}