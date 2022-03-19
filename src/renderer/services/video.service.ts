import ArraySearch from 'arraysearch'
import RefLink from '../../main/RefLink'
import { AccountService } from './account.service'

import DefaultThumbnail from '../assets/img/default-thumbnail.jpg'
import { IpfsService } from './ipfs.service'
import hive from '@hiveio/hive-js'
import { binary_to_base58 } from 'base58-js'

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
  static async getNewThumbnailURL(author, permlink) {
    try {
      const content = await hive.api.getContentAsync(author, permlink)

      console.log(content)
      const parsedMeta = JSON.parse(content.json_metadata)

      if (parsedMeta && typeof parsedMeta === 'object' && typeof parsedMeta.image[0] === 'string') {
        let url = parsedMeta.image[0]

        if (parsedMeta.image[0]) {
          if (parsedMeta.image[0].includes('ipfs-3speak.b-cdn.net')) {
            const pathArray = url.split('/')
            const protocol = pathArray[3]
            const host = pathArray[4]
            url = `https://images.hive.blog/p/${binary_to_base58(
              Buffer.from('https://ipfs.io/' + protocol + '/' + host),
            )}?format=jpeg&mode=cover&width=340&height=191`
          } else {
            //Fix for bad frontends overriding our data
            let realImage
            if (!parsedMeta.image[1].includes('3speakcontent.co')) {
              realImage = parsedMeta.image[1]
            } else {
              parsedMeta.image[0]
            }
            url = `https://images.hive.blog/p/${binary_to_base58(
              Buffer.from(realImage),
            )}?format=jpeg&mode=cover&width=340&height=191`
          }
        } else {
          url = `https://img.3speakcontent.co/${permlink}/thumbnails/default.png`
          console.log(url, permlink)
        }

        return url
      } else {
        return DefaultThumbnail
        //throw new Error("Invalid post metadata");
      }
    } catch {
      return DefaultThumbnail
    }
  }
}
