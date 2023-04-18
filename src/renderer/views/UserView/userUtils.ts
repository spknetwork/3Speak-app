// userUtils.ts
export function transformGraphqlToNormal(data: any) {

    let blob = []
    for(let video of data) {
      console.log(video)
      blob.push({
        created: new Date(video.created_at),
        author: video.author,
        permlink: video.permlink,
        tags: video.tags,
        title: video.title,
        duration: video.json_metadata.video.info.duration || video.json_metadata.video.duration,
        //isIpfs: val.json_metadata.video.info.ipfs || thumbnail ? true : false,
        //ipfs: val.json_metadata.video.info.ipfs,
        isIpfs: true,
        images: {
          thumbnail: video.three_video.thumbnail_url.replace('img.3speakcontent.co', 'media.3speak.tv'),
          poster: video.three_video.thumbnail,
          post: video.three_video.thumbnail,
          ipfs_thumbnail: video.three_video.thumbnail
          /*ipfs_thumbnail: thumbnail
            ? `/ipfs/${thumbnail.slice(7)}`
            : `/ipfs/${val.json_metadata.video.info.ipfsThumbnail}`,
          thumbnail: `https://threespeakvideo.b-cdn.net/${val.permlink}/thumbnails/default.png`,
          poster: `https://threespeakvideo.b-cdn.net/${val.permlink}/poster.png`,
          post: `https://threespeakvideo.b-cdn.net/${val.permlink}/post.png`,*/
        },
      })
    }
    return blob;
  }

