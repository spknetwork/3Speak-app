import PromiseIPC from 'electron-promise-ipc'

export async function getAccounts() {
  const getAccounts = await PromiseIPC.send('accounts.ls', {} as any)

  return getAccounts
}
