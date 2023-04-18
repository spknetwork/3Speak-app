import { VideoInfo, VideoSource } from '../../../common/models/video.model'
import RefLink from '../../../main/RefLink'
import PromiseIPC from 'electron-promise-ipc'

export async function permalinkToPostInfo(reflink) {
  if (!(reflink instanceof RefLink)) {
    reflink = RefLink.parse(reflink)
  }
  const post_content = (
    (await PromiseIPC.send('distiller.getContent', reflink.toString())) as any
  ).json_content
  return post_content
}