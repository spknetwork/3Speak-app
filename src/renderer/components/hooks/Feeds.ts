import { gql, useQuery } from '@apollo/client'
import { useMemo } from 'react'
import { IndexerClient } from '../../App'

const LATEST_BY_USERNAME = gql`
  query Query($author: String) {
    latestFeed(author: $author, limit: 15) {
      items {
        ... on CeramicPost {
          stream_id
          version_id
          parent_id
          title
          body
          json_metadata
          app_metadata
        }
        ... on HivePost {
          created_at
          updated_at
          parent_author
          parent_permlink
          permlink
          author
          title
          body
          lang
          post_type
          app
          tags
          json_metadata
          app_metadata
          community_ref

          three_video

          children {
            parent_author
            parent_permlink
            permlink
            title
            body
            title
            lang
            post_type
            app
            json_metadata
            app_metadata
            community_ref
          }
        }
        __typename
      }
    }
  }
`
const LASTEST_FEED = gql`
  query LatestFeedQuery {
    latestFeed(limit: 20) {
      items {
        ... on CeramicPost {
          stream_id
          version_id
          parent_id
          title
          body
          json_metadata
          app_metadata
        }
        ... on HivePost {
          created_at
          updated_at
          parent_author
          parent_permlink
          permlink
          author
          title
          body
          lang
          post_type
          app
          tags
          json_metadata
          app_metadata
          community_ref

          three_video

          children {
            parent_author
            parent_permlink
            permlink
            title
            body
            title
            lang
            post_type
            app
            json_metadata
            app_metadata
            community_ref
          }
        }
        __typename
      }
    }
  }
`

function transformGraphqlToNormal(data) {
  let blob = []
  for (let video of data) {
    console.log(video)
    if (video.three_video) {
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
          thumbnail: video.three_video.thumbnail_url,
          poster: video.three_video.thumbnail,
          post: video.three_video.thumbnail,
          ipfs_thumbnail: video.three_video.thumbnail,
          /*ipfs_thumbnail: thumbnail
                ? `/ipfs/${thumbnail.slice(7)}`
                : `/ipfs/${val.json_metadata.video.info.ipfsThumbnail}`,
              thumbnail: `https://threespeakvideo.b-cdn.net/${val.permlink}/thumbnails/default.png`,
              poster: `https://threespeakvideo.b-cdn.net/${val.permlink}/poster.png`,
              post: `https://threespeakvideo.b-cdn.net/${val.permlink}/post.png`,*/
        },
      })
    }
  }
  return blob
}

export function useNewFeed() {
  const { data, loading } = useQuery(LASTEST_FEED, {
    client: IndexerClient,
  })

  console.log(data)
  const videos = data?.latestFeed?.items || []

  return useMemo(() => {
    return transformGraphqlToNormal(videos)}, [videos])
}
