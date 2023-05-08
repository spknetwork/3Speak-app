import RefLink from '../../../main/RefLink'
import PromiseIPC from 'electron-promise-ipc'

export async function getProfileAbout(reflink) {
  if (!(reflink instanceof RefLink)) {
    reflink = RefLink.parse(reflink)
  }
  switch (reflink.source.value) {
    case 'hive': {
      // type error: 2nd argument string does not match function signature
      // const userAboutText = JSON.parse(
      //   ((await PromiseIPC.send('distiller.getAccount', `hive:${reflink.root}` as any)) as any)
      //     .json_content.posting_json_metadata,
      // ).profile.about
      const res = (await PromiseIPC.send(
        'distiller.getAccount',
        `hive:${reflink.root}` as any,
      )) as any

      if (!res?.json_content?.posting_json_metadata) {
        return ''
      } else {
        const metadata = JSON.parse(res.json_content.posting_json_metadata)
        return metadata.profile.about
      }
    }
    default: {
      throw new Error(`Unknown account provider ${reflink.source.value}`)
    }
  }
}