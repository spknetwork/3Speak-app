import ArraySearch from 'arraysearch'
import RefLink from '../../main/RefLink'
import { AccountService } from './account.service'

import DefaultThumbnail from '../assets/img/default-thumbnail.jpg'
import { IpfsService } from './ipfs.service'

const Finder = ArraySearch.Finder

export class VideoService {
  static async getVideoSourceURL(permalink) {
    let post_content
    if (typeof permalink === 'object') {
      post_content = permalink
    } else {
      post_content = await AccountService.permalinkToVideoInfo(permalink)
    }

    const videoSource = Finder.one.in(post_content.sources).with({
      type: 'video',
    })
    if (videoSource) {
      const url = videoSource.url as string
      if (typeof url === 'string' && !url.startsWith('ipfs')) {
        return url
      }

      try {
        const cid = IpfsService.urlToCID(videoSource.url)
        let gateway
        try {
          // getGateway requires 2 arguments. passing empty object.
          gateway = await IpfsService.getGateway(cid, true)
        } catch (ex) {
          console.error(ex)
          throw ex
        }
        return gateway + IpfsService.urlToIpfsPath(videoSource.url)
      } catch {
        //return `https://cdn.3speakcontent.co/${reflink.root}/${reflink.permlink}`;
        return videoSource.url
      }
    } else {
      throw new Error('Invalid post metadata')
    }
  }
  /**
   * Retrieves thumbnail URL.
   * @param {String|Object} permalink
   */
  static async getThumbnailURL(permalink) {
    let post_content
    if (typeof permalink === 'object') {
      post_content = permalink
    } else {
      try {
        post_content = await AccountService.permalinkToVideoInfo(permalink)
      } catch {
        const reflink = RefLink.parse(permalink)
        // return DefaultThumbnail
        return `https://threespeakvideo.b-cdn.net/${reflink.permlink}/thumbnails/default.png`
      }
    }

    const thumbnailSource = Finder.one.in(post_content.sources).with({
      type: 'thumbnail',
    })
    if (thumbnailSource) {
      const url = thumbnailSource.url as string

      if (typeof url === 'string' && !url.startsWith('ipfs')) {
        return url
      }

      try {
        const cid = IpfsService.urlToCID(thumbnailSource.url)
        const gateway = await IpfsService.getGateway(cid, true)
        return gateway + IpfsService.urlToIpfsPath(thumbnailSource.url)
      } catch (ex) {
        return thumbnailSource.url
      }
    } else {
      return DefaultThumbnail
    }
  }
}
