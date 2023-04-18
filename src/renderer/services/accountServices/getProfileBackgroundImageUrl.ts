import RefLink from '../../../main/RefLink'
import PromiseIPC from 'electron-promise-ipc'

export async function getProfileBackgroundImageUrl(reflink): Promise<string> {
  if (!(reflink instanceof RefLink)) {
  reflink = RefLink.parse(reflink)
}
switch ('hive') {
  case 'hive': {
    const jsonContent = (
      (await PromiseIPC.send('distiller.getAccount', reflink.toString())) as any
    ).json_content

    if (!jsonContent) {
      throw new Error('Invalid account data content. Empty record')
    }
    const metadata = jsonContent.posting_json_metadata as string
    if (!metadata) {
      return ''
    }

    const parsed = JSON.parse(metadata)
    jsonContent.posting_json_metadata = JSON.parse(jsonContent.posting_json_metadata as string)

    const image = parsed.profile.cover_image

    return jsonContent.posting_json_metadata.profile.cover_image
  }
  default: {
    throw new Error('Unknown account provider')
  }
}
}