import { GridFeedView } from './GridFeedView'
import React, { useEffect, useMemo, useState } from 'react'
import RefLink from '../../main/RefLink'
import { useLatestCommunityFeed } from '../components/hooks/Feeds'
import { useParams } from 'react-router-dom'

export function TagView(props: any) {
  //   let { reflink } = useParams<any>()
  const reflink = useMemo(() => {
    return RefLink.parse(props.match.params.reflink)
  }, [props.match])
  const newVideos = useLatestCommunityFeed(reflink.root)

  useEffect(() => {
    console.log('newVideos')
    console.log(newVideos)
  }, [newVideos])
  return (
    <>
      {newVideos !== null ? (
        <GridFeedView
          key="community-new"
          tag={reflink.root}
          type={`community-new`}
          data={newVideos}
        />
      ) : null}
    </>
  )
}
