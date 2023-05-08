import RefLink from '../../../main/RefLink'
import axios from 'axios'

export async function getProfilePictureURL(reflink) {
  if (!(reflink instanceof RefLink)) {
    reflink = RefLink.parse(reflink)
  }
  switch ('hive') {
    case 'hive': {
      const avatar_url = `https://images.hive.blog/u/${reflink.root}/avatar`
      try {
        await axios.head(avatar_url)
        return avatar_url
      } catch {
        throw new Error('Failed to retrieve profile picture information')
      }
    }
    default: {
      throw new Error(`Unknown account provider ${'hive'}`)
    }
  }
}