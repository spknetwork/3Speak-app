import { URL } from 'url';
import PromiseIpc from 'electron-promise-ipc';
import CID from 'cids';
import { NotificationManager } from 'react-notifications';

export async function PinLocally(videoInfo: any, reflink: string) {
  const cids = []
  for (const source of videoInfo.sources) {
    const url = new URL(source.url)
    try {
      new CID(url.host)
      cids.push(url.host)
    } catch {}
  }

  if (cids.length !== 0) {
    NotificationManager.info('Pinning in progress')
    await PromiseIpc.send('pins.add', {
      _id: reflink,
      source: 'Watch Page',
      cids,
      expire: null,
      meta: {
        title: videoInfo.title,
      },
    } as any)
    NotificationManager.success(
      `Video with reflink of ${reflink} has been successfully pinned! Thank you for contributing!`,
      'Pin Successful',
    )
  } else {
    NotificationManager.warning('This video is not available on IPFS')
  }
}