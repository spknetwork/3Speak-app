import RefLink from '../../../main/RefLink'
import PromiseIPC from 'electron-promise-ipc'

export async function getFollowerCount(reflink) {
  if (!(reflink instanceof RefLink)) {
    reflink = RefLink.parse(reflink)
  }
  switch (reflink.source.value) {
    case 'hive': {
      const followerCount = await PromiseIPC.send(
        'distiller.getFollowerCount',
        reflink.toString(),
      )
      return followerCount
    }
    default: {
      throw new Error(`Unknown account provider ${reflink.source.value}`)
    }
  }
}