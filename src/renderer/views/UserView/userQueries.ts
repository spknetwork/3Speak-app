// userQueries.ts
import { gql } from '@apollo/client';

export const QUERY = gql`

query Query($author: String) {

latestFeed(author:$author, limit: 15) {
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
;