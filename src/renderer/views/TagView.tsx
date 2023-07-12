import { GridFeedView } from './GridFeedView'
import React, { useEffect, useMemo, useState } from 'react'
import RefLink from '../../main/RefLink'
import { useNewTagFeed } from '../components/hooks/Feeds'
import { useParams } from 'react-router-dom'

export function TagView(props: any) {
  //   let { reflink } = useParams<any>()
  const reflink = useMemo(() => {
    return RefLink.parse(props.match.params.reflink)
  }, [props.match])
  const newVideos = useNewTagFeed(reflink.root)

  return (
    <>
      {newVideos !== null ? (
        <GridFeedView key="tag-new" type={`tag-new`} tag={reflink.root} data={newVideos} />
      ) : null}
    </>
  )
}
