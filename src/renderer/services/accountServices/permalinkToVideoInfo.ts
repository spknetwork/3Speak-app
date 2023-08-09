import { VideoInfo, VideoSource } from '../../../common/models/video.model'
import RefLink from '../../../main/RefLink'
import PromiseIPC from 'electron-promise-ipc'

export async function permalinkToVideoInfo(reflink, options: any = {}): Promise<VideoInfo> {
  if (!reflink) return undefined

  if (!(reflink instanceof RefLink)) {
    reflink = RefLink.parse(reflink)
  }
  if (!options.type) {
    options.type == '*'
  }

  const postContent = await PromiseIPC.send('distiller.getContent', reflink.toString())
  console.log('postContent', postContent)
  const post_content = postContent.json_content
  console.log('post_content', post_content)
  if (!post_content) {
    throw new Error('Invalid post content. Empty record')
  }
  switch (reflink.source.value) {
    case 'hive': {
      const json_metadata = post_content.json_metadata
      console.log('json_metadata', json_metadata)
      const size = json_metadata.video.info.filesize
      if (!(json_metadata.app && options.type === 'video')) {
        if (json_metadata.type) {
          if (!json_metadata.type.includes('3speak/video')) {
            throw new Error('Invalid post content. Not a video')
          }
        }
        //throw new Error("Invalid post content. Not a video");
      }
      const sources: VideoSource[] = []
      let title
      let description
      let duration
      if (json_metadata.video.info.sourceMap[1]) {
        console.log('json_metadata.video.info.sourceMap', json_metadata.video.info.sourceMap)
        console.log('sources', sources)
        console.log('json_metadata', json_metadata)
        sources.push(...json_metadata.video.info.sourceMap)
        return {
          sources,
          creation: new Date(post_content.created + 'Z').toISOString(),
          title: post_content.title,
          description: post_content.body,
          tags: json_metadata.tags,
          refs: [`hive:${post_content.author}:${post_content.permlink}`], //Reserved for future use when multi account system support is added.
          meta: {
            duration: json_metadata.duration,
          }, //Reserved for future use.
          reflink: `hive:${post_content.author}:${post_content.permlink}`,
          size,
        }
      }
      try {
        const video_info = json_metadata.video.info
        const video_content = json_metadata.video.content
        description = video_content.description
        title = video_info.title
        duration = video_info.duration
        console.log('video_info', video_info)
        console.log('video_info.file', video_info.file)
        console.log('video_info.ipfs', video_info.ipfs)
        console.log('video_info.ipfsThumbnail', video_info.ipfsThumbnail)
        const urls = []
        if (video_info.ipfs != null && video_info.ipfs) {
          urls.push(`ipfs://${video_info.ipfs}`)
        }
        if (video_info.ipfsThumbnail != null && video_info.ipfsThumbnail) {
          sources.push({
            type: 'thumbnail',
            url: `ipfs://${video_info.ipfsThumbnail}`,
          })
        } else if (video_info.sourceMap[0].url) {
          console.log('video_info.sourceMap[0].url', video_info.sourceMap[0].url)
          sources.push({
            type: 'thumbnail',
            url: `${video_info.sourceMap[0].url}`,
          })
        }
        if (video_info.file) {
          urls.push(`https://threespeakvideo.b-cdn.net/${reflink.permlink}/${video_info.file}`)
        } else {
          urls.push(`https://threespeakvideo.b-cdn.net/${reflink.permlink}/default.m3u8`)
        }

        for (const url of urls) {
          sources.push({
            type: 'video',
            url,
            /**
             * Reserved if a different player must be used on per format basis.
             *
             * If multi-resolution support is added in the future continue to use the url/format scheme.
             * url should link to neccessary metadata.
             */
            format: url.split('.').slice(-1)[0],
          })
        }
      } catch (ex) {
        title = post_content.title
        description = post_content.body
      }
      console.log('sources', sources)
      return {
        sources,
        creation: new Date(post_content.created + 'Z').toISOString(),
        title,
        description,
        tags: json_metadata.tags,
        refs: [`hive:${post_content.author}:${post_content.permlink}`], //Reserved for future use when multi account system support is added.
        meta: { duration }, //Reserved for future use.
        reflink: `hive:${post_content.author}:${post_content.permlink}`,
      }
    }
    default: {
      throw new Error('Unknown account provider')
    }
  }
}
