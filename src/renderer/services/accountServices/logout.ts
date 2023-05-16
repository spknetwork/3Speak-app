import { hive } from '@hiveio/hive-js'
import PromiseIPC from 'electron-promise-ipc'
import ArraySearch from 'arraysearch'

const Finder = ArraySearch.Finder

export async function logout(profileID) {
  await PromiseIPC.send('accounts.deleteProfile', profileID)
  return
}