import React, { useEffect, useMemo, useState } from 'react'
import { FaCalendarAlt, FaEye } from 'react-icons/fa'
import Reflink from '../../../main/RefLink'
import convert from 'convert-units'
import DateTime from 'date-and-time'
import { AccountService } from '../../services/account.service'
import { VideoService } from '../../services/video.service'

export function VideoTeaser(props: any) {
  const [video_info, setVideoInfo] = useState<any>({})
  const [thumbnail, setThumbnail] = useState('')
  const reflink = useMemo(() => {
    return Reflink.parse(props.reflink)
  }, [])

  useEffect(() => {
    const load = async () => {
      setVideoInfo(await AccountService.permalinkToVideoInfo(props.reflink))
      setThumbnail(await VideoService.getThumbnailURL(props.reflink))
    }

    void load()
  }, [])

  return (
    <div className="video-card-list">
      <div className="teaser_holder video-card-image">
        <div className="card-label">
          {(() => {
            const pattern = DateTime.compile('mm:ss')
            return DateTime.format(new Date(video_info.meta.duration * 1000), pattern)
          })()}
        </div>
        <a href={`#/watch/${props.reflink}`}>
          <img className="img-fluid bg-dark" src={thumbnail} alt="" />
        </a>
      </div>
      <span className="video-card-body">
        <div className="video-title">
          <a
            href={`#/watch/${props.reflink}`}
            style={{ textOverflow: 'ellipsis', overflow: 'nowrap' }}
          >
            {video_info.title}
          </a>
        </div>
        <div className="video-page">
          <a href={`#/user/${reflink.source.value}:${reflink.root}`}>{reflink.root}</a>
        </div>
        <div className="video-view">
          <FaEye /> Unknown views
          <span>
            <FaCalendarAlt />
            {(() => {
              if (video_info.creation) {
                const dateBest = convert(
                  (new Date(new Date().toUTCString()) as any) / 1 -
                    Date.parse(video_info.creation) / 1,
                )
                  .from('ms')
                  .toBest()
                if (Math.round(dateBest.val) >= 2) {
                  return `${Math.round(dateBest.val)} ${dateBest.plural} ago`
                } else {
                  return `${Math.round(dateBest.val)} ${dateBest.singular} ago`
                }
              }
            })()}
          </span>
        </div>
      </span>
    </div>
  )
}
