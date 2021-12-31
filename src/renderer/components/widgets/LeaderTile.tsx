import React, { useEffect, useMemo, useState } from 'react'
import RefLink from '../../../main/RefLink'
import { AccountService } from '../../services/account.service'

export interface LeaderTileProps {
  info: {
    score: number
    rank: number
  }
  reflink: string
}

export function LeaderTile(props: LeaderTileProps) {
  const reflink = useMemo(() => {
    return RefLink.parse(props.reflink)
  }, [props.reflink])

  const [profilePicture, setProfilePicture] = useState('')
  const [borderLeftCode, setBorderLeftCode] = useState('')

  useEffect(() => {
    const load = async () => {
      console.log(`displaying leader tile`, props)
      let color: string
      switch (props.info.rank) {
        case 1: {
          color = '#d4af37 solid 6px'
          break
        }
        case 2: {
          color = '#bec2cb solid 6px'
          break
        }
        case 3: {
          color = '#b08d57 solid 6px'
          break
        }
      }

      setProfilePicture(await AccountService.getProfilePictureURL(props.reflink))
      setBorderLeftCode(color)
    }

    void load()
  }, [])

  return (
    <div className="channels-card" style={{ borderLeft: borderLeftCode }}>
      <div className="channels-card-image">
        <a href={`#/user/${props.reflink.toString()}`}>
          <img className="img-fluid" src={profilePicture} alt="" />
        </a>
        <div className="channels-card-image-btn">
          <a href={`#/user/${reflink.toString()}`} className="btn btn-outline-primary btn-sm">
            View Channel
          </a>
        </div>
      </div>
      <div className="channels-card-body">
        <div className="channels-title">
          <a href={`#/user/${reflink.toString()}`}>{reflink.root}</a>
        </div>
        <div>
          <i></i>
        </div>
      </div>
      <div className="channels-card-rank badge badge-dark text-white">Rank: {props.info.rank}</div>
      <div className="channels-card-score badge badge-dark text-white">
        Score: {Math.round(props.info.score)}
      </div>
    </div>
  )
}
