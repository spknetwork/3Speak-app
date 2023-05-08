import RefLink from '../../../main/RefLink'
import PromiseIPC from 'electron-promise-ipc'

export async function getAccountBalances(reflink) {
  if (!(reflink instanceof RefLink)) {
    reflink = RefLink.parse(reflink)
  }
  switch (reflink.source.value) {
    case 'hive': {
      let accountBalances =
        // type error: 2nd argument (string) does not match function signature
        ((await PromiseIPC.send('distiller.getAccount', `hive:${reflink.root}` as any)) as any)
          .json_content

      accountBalances = {
        hive: accountBalances.balance,
        hbd: accountBalances.sbd_balance,
      }
      return accountBalances
    }
    default: {
      throw new Error(`Unknown account provider ${reflink.source.value}`)
    }
  }
}