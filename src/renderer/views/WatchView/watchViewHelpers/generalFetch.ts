import { AccountService } from '../../../services/account.service';
import CID from 'cids'
import { URL } from 'url'

export async function generalFetch(
  reflink: string,
  setVideoInfo: (info: any) => void,
  setPostInfo: (info: any) => void,
  setProfilePictureUrl: (url: string) => void,
  setRootCid: (cid: string) => void
) {
  const info = await AccountService.permalinkToVideoInfo(reflink, { type: 'video' })
  setVideoInfo(info)
  setPostInfo(await AccountService.permalinkToPostInfo(reflink))
  try {
    //Leave profileURL default if error is thrown when attempting to retrieve profile picture
    setProfilePictureUrl(await AccountService.getProfilePictureURL(reflink))
  } catch (ex) {
    console.error(ex)
    throw ex
  }
  document.title = `3Speak - ${info.title}`
  const cids = []
  for (const source of info.sources) {
    const url = new URL(source.url)
    try {
      new CID(url.host)
      cids.push(url.host)
    } catch {}
  }
  setRootCid(cids[0])
}