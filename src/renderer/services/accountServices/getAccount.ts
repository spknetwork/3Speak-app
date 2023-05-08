import PromiseIPC from 'electron-promise-ipc'

export async function getAccount(profileID) {
  const getAccount = await PromiseIPC.send('accounts.get', profileID)
  return getAccount
}
