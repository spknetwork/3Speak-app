import { gql, useQuery } from '@apollo/client'
import { useEffect, useMemo } from 'react'
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

          # children {
          #   parent_author
          #   parent_permlink
          #   permlink
          #   title
          #   body
          #   title
          #   lang
          #   post_type
          #   app
          #   json_metadata
          #   app_metadata
          #   community_ref
          # }
        }
        __typename
      }
    }
  }
`
const LATEST_FEED = gql`
query LatestFeed {
  feed: socialFeed {
    items {
      body
      created_at
      parent_author
      parent_permlink
      permlink
      title
      updated_at
      ... on HivePost {
        parent_author
        parent_permlink
        author {
          username
        }
        json_metadata {
          raw
        }
        stats {
          num_comments
          num_votes
          total_hive_reward
        }
        app_metadata
        spkvideo
        refs
        post_type
        permlink
        title
        tags
        updated_at
        body
        community
        created_at
      }
    }
  }
}
`
const FIRST_UPLOADS = gql`
query FirstUploadsFeed {
  feed: socialFeed(
    spkvideo: {
      firstUpload: true
    }
  ) {
    items {
      body
      created_at
      parent_author
      parent_permlink
      permlink
      title
      updated_at
      ... on HivePost {
        parent_author
        parent_permlink
        author {
          username
        }
        json_metadata {
          raw
        }
        stats {
          num_comments
          num_votes
          total_hive_reward
        }
        app_metadata
        spkvideo
        refs
        post_type
        permlink
        title
        tags
        updated_at
        body
        community
        created_at
      }
    }
  }
}
`
const TRENDING_FEED = gql`
query TrendingFeed {
  feed: trendingFeed {
    items {
      body
      created_at
      parent_author
      parent_permlink
      permlink
      title
      updated_at
      ... on HivePost {
        parent_author
        parent_permlink
        author {
          username
        }
        json_metadata {
          raw
        }
        stats {
          num_comments
          num_votes
          total_hive_reward
        }
        app_metadata
        spkvideo
        refs
        post_type
        permlink
        title
        tags
        updated_at
        body
        community
        created_at
      }
    }
  }
}
`

const LATEST_COMMUNITY_FEED = gql`
  query LatestCommunityFeed($community: String) {
    latestFeed(feedOptions: {
      byCommunity: {
        _id: $community
      }
    }) {
      items {
        body
        created_at
        parent_author
        parent_permlink
        permlink
        title
        updated_at
        ... on HivePost {
          parent_author
          parent_permlink
          author {
            username
          }
          json_metadata {
            raw
          }
          stats {
            num_comments
            num_votes
            total_hive_reward
          }
          app_metadata
          spkvideo
          refs
          post_type
          permlink
          title
          tags
          updated_at
          body
          community
          created_at
        }
      }
    }
  }
`

const TRENDING_COMMUNITY_FEED = gql`
  query LatestCommunityFeed($community: String) {
    trendingFeed(feedOptions: {
      byCommunity: {
        _id: $community
      }
    }) {
      items {
        body
        created_at
        parent_author
        parent_permlink
        permlink
        title
        updated_at
        ... on HivePost {
          parent_author
          parent_permlink
          author {
            username
          }
          json_metadata {
            raw
          }
          stats {
            num_comments
            num_votes
            total_hive_reward
          }
          app_metadata
          spkvideo
          refs
          post_type
          permlink
          title
          tags
          updated_at
          body
          community
          created_at
        }
      }
    }
  }
`

function transformGraphqlToNormal(data) {
  let blob = []
  for (let video of data) {
    console.log(video)
    if (video.spkvideo) {
      try {
        blob.push({
          created: new Date(video.created_at),
          author: video.author.username,
          permlink: video.permlink,
          tags: video.tags,
          title: video.title,
          duration: video.json_metadata.raw.video.info.duration || video.json_metadata.raw.video.duration,
          views: video.stats.total_hive_reward > 0 ? Math.abs(Number((Math.log(video.stats.total_hive_reward) / 100).toFixed(2))) : 0,
          
          
          isIpfs: video.app_metadata.spkvideo.storage_type === "ipfs",
          images: {
            thumbnail: video.spkvideo.thumbnail_url.replace('img.3speakcontent.co', 'media.3speak.tv'),
            
            /*ipfs_thumbnail: thumbnail
                  ? `/ipfs/${thumbnail.slice(7)}`
                  : `/ipfs/${val.json_metadata.video.info.ipfsThumbnail}`,
                thumbnail: `https://threespeakvideo.b-cdn.net/${val.permlink}/thumbnails/default.png`,
                poster: `https://threespeakvideo.b-cdn.net/${val.permlink}/poster.png`,
                post: `https://threespeakvideo.b-cdn.net/${val.permlink}/post.png`,*/
          },
        })
      } catch (ex) {
        //More fault tolerance
        console.log(ex)
      }
    }
  }
  return blob
}

export function useGraphqlFeed(props: any) {
  let query
  if(props.type === "trending") {
    query = TRENDING_FEED
  } else if(props.type === "first_upload") {
    query = FIRST_UPLOADS;
  } else if(props.type === "community-new") {
    query = LATEST_COMMUNITY_FEED
  } else if(props.type === "community-trends") {
    query = TRENDING_COMMUNITY_FEED
  } else {
    query = LATEST_FEED
  }
  const { data, loading, refetch } = useQuery(query, {
    client: IndexerClient,
    variables: {
      community: props.community
    }
  })

  console.log(data)
  const videos = data?.feed?.items || []


  useEffect(() => {
    refetch({

    })
  }, [props.type])

  return useMemo(() => {
    return transformGraphqlToNormal(videos)
  }, [videos])
}

export function useLatestCommunityFeed(parent_permlink) {
  const { data, loading, error } = useQuery(LATEST_COMMUNITY_FEED, {
    client: IndexerClient,
    variables: { parent_permlink },
  })
  const videos = data?.latestFeed?.items || []

  return useMemo(() => {
    return transformGraphqlToNormal(videos)
  }, [videos])
}
export function useTrendingCommunityFeed(parent_permlink) {
  const { data, loading, error } = useQuery(TRENDING_COMMUNITY_FEED, {
    client: IndexerClient,
    variables: { parent_permlink },
  })
  const videos = data?.latestFeed?.items || []

  return useMemo(() => {
    return transformGraphqlToNormal(videos)
  }, [videos])
}
