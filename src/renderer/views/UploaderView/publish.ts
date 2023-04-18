import { AccountService } from '../../services/account.service'
import randomstring from 'randomstring'
import { compileVideoCid } from './compileVideoCid'
export const publish = async ({videoInfo, thumbnailInfo, publishFormTitle, publishFormDescription, publishFormTags, setBlockedGlobalMessage, ipfs}) => {
    const videoCid = await compileVideoCid(videoInfo, thumbnailInfo, ipfs)
  // const formData = FormUtils.formToObj(new FormData(publishForm))

  let tags: string[] = []
  if (publishFormTags) {
    tags = publishFormTags.replace(/\s/g, '').split(',')
  }

  console.log(`thumbnail info`, thumbnailInfo)

  const sourceMap = []
  if (thumbnailInfo.path) {
    sourceMap.push({
      type: 'thumbnail',
      url: `ipfs://${videoCid}/${thumbnailInfo.path}`,
    })
  }

  if (videoInfo) {
    sourceMap.push({
      type: 'video',
      url: `ipfs://${videoCid}/${videoInfo.path}`,
      format: 'm3u8',
    })
  }
  const permlink = `speak-${randomstring
    .generate({
      length: 8,
      charset: 'alphabetic',
    })
    .toLowerCase()}`
  //     console.log(permlink)
  console.log(`source map`)
  console.log(sourceMap)

  setBlockedGlobalMessage('Publishing')

  const filesize = videoInfo.size + thumbnailInfo.size

  try {
    const [reflink] = await AccountService.postComment({
      accountType: 'hive',
      title: publishFormTitle || 'Untitled video',
      body: publishFormDescription || '',
      permlink,
      tags,
      json_metadata: {
        title: publishFormTitle || 'Untitled video',
        description: publishFormDescription || '',
        tags,
        sourceMap,
        filesize,
        created: new Date(),
        lang: videoInfo.language,
        video: {
          duration: videoInfo.duration,
        },
        app: '3speak/app-beta',
        type: '3speak/video',
      },
    })

    setTimeout(() => {
      location.hash = `#/watch/${reflink}`
      setBlockedGlobalMessage('done')
    }, 15000)
  } catch (error) {
    console.error(`Error in postComment operation ${error.message}`)
    throw error
  }
};
