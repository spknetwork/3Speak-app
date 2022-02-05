import React, { useEffect, useMemo, useState } from 'react'
import { Col } from 'react-bootstrap'
import { FaChevronCircleRight } from 'react-icons/fa'

import RefLink from '../../../main/RefLink'
import { AccountService } from '../../services/account.service'

export function CommunityTile(props: any) {
  const reflink = useMemo(() => {
    return RefLink.parse(props.reflink)
  }, [props.reflink])

  const [communityPicture, setCommunityPicture] = useState('')

  useEffect(() => {
    const load = async () => {
      setCommunityPicture(await AccountService.getProfilePictureURL(props.reflink))
    }

    void load()
  }, [])

  return (
    <Col className="col-md-3 col-sm-3 mb-3" md={3} sm={3}>
      <a href={`#/community/${props.reflink}`} className="font-weight-bold">
        <div className="community-card channels-card">
          <div className="text-left" style={{ display: 'inline-block', float: 'left' }}>
            <img
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                verticalAlign: 'middle',
              }}
              src={communityPicture + '?size=icon'}
            />
            {props.info.title}
          </div>
          <div
            className="text-right"
            style={{
              display: 'inline-block',
              paddingTop: '2px',
              float: 'right',
            }}
          >
            <div></div>
            <span className="text-success"></span>
            <FaChevronCircleRight />
          </div>
          <div style={{ clear: 'both' }}></div>
        </div>
      </a>
    </Col>
  )
}
