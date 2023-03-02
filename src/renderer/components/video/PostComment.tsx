import DateAndTime from 'date-and-time'
import DOMPurify from 'dompurify'
const electronIpc = require('electron-promise-ipc')
import { clipboard } from 'electron'
import React, { useEffect, useMemo, useState } from 'react'
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { BsThreeDotsVertical } from 'react-icons/bs'
import ReactMarkdown from 'react-markdown'

import RefLink from '../../../main/RefLink'
import { AccountService } from '../../services/account.service'
import { CommentForm } from './PostComment/CommentForm'
import { VoteWidget } from './VoteWidget'
import { millisecondsAsString } from '../../../common/utils/unit-conversion.functions'

const CustomToggle = React.forwardRef(({ children, onClick }: any, ref: any) => (
  <a
    href=""
    ref={ref}
    onClick={(e) => {
      e.preventDefault()
      onClick(e)
    }}
  >
    <BsThreeDotsVertical />
    {children}
  </a>
))

/**
 * @todo Implement displaying numbers of comments and comment value. Requires support on backend to count votes.
 * @todo Implement interactibility.
 * @todo Implement 3 dot action menu.
 */
export function PostComment(props: any) {
  const [commentInfo, setCommentInfo] = useState({ description: '', creation: 0 })

  const [replying, setReplying] = useState(false)
  const [profilePicture, setProfilePicture] = useState('')

  useEffect(() => {
    const load = async () => {
      let info
      let profilePicture
      if (props.commentInfo) {
        info = props.commentInfo
      } else {
        info = await AccountService.permalinkToVideoInfo(props.reflink)
      }
      if (info) {
        profilePicture = setProfilePicture(await AccountService.getProfilePictureURL(info.reflink))
        setCommentInfo(info)
      }
    }

    void load()
  }, [])

  const handleAction = async (eventKey) => {
    const reflink = props.reflink
    switch (eventKey) {
      case 'block_post': {
        await electronIpc.send('blocklist.add', reflink, {
          reason: 'manual block',
        })
        break
      }
      case 'block_user': {
        const ref = RefLink.parse(reflink) as any as any
        await electronIpc.send('blocklist.add', `${ref.source.value}:${ref.root}`, {
          reason: 'manual block',
        })
        break
      }
      case 'copy_reflink': {
        clipboard.writeText(reflink, clipboard as any)
        break
      }
      default: {
        throw new Error(`Unrecognized action: ${eventKey}!`)
      }
    }
  }

  const postTimeDistance = useMemo(() => {
    return millisecondsAsString((new Date() as any) - (new Date(commentInfo.creation) as any))
  }, [commentInfo])

  const postTime = useMemo(() => {
    return DateAndTime.format(new Date(commentInfo.creation), 'YYYY/MM/DD HH:mm:ss')
  }, [commentInfo])

  return (
    <div>
      <div className="col">
        <div className="thumbnail mr-2 float-left">
          <img className="img-responsive user-photo" width="24" src={profilePicture} />
        </div>
      </div>
      <div className="col" style={{ zIndex: 1000 }}>
        <div className="mr-3 float-right">
          <Dropdown onSelect={handleAction}>
            <Dropdown.Toggle as={CustomToggle}></Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item style={{ color: 'red' }} eventKey="block_post">
                Block post
              </Dropdown.Item>
              <Dropdown.Item style={{ color: 'red' }} eventKey="block_user">
                Block user
              </Dropdown.Item>
              <Dropdown.Item eventKey="copy_reflink">Copy to clipboard permlink</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      <div className="col-12">
        <div className="panel ml-2 panel-default">
          <div className="panel-heading ml-4">
            <strong>
              <a href={`#/user?=${props.reflink}`}>{RefLink.parse(props.reflink).root}</a>{' '}
            </strong>
            •{' '}
            <span className="text-muted">
              <OverlayTrigger overlay={<Tooltip id="post-time">{postTime}</Tooltip>}>
                <div>{postTimeDistance}</div>
              </OverlayTrigger>
            </span>
          </div>
          <div className="panel-body mt-1">
            <ReactMarkdown
              skipHtml={false}
            >{DOMPurify.sanitize(commentInfo.description)}</ReactMarkdown>
          </div>
          <div className="panel-footer ml-0 ml-md-4">
            <hr />
            <ul className="list-inline list-inline-separate">
              <li className="list-inline-item">
                <VoteWidget reflink={props.reflink} />
              </li>
              <li
                className="list-inline-item"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setReplying(!replying)
                }}
              >
                {replying ? 'Cancel' : 'Reply'}
              </li>
            </ul>
          </div>
        </div>
      </div>
      {replying ? (
        <div className="box mb-3 clearfix">
          <CommentForm parent_reflink={props.reflink} onCommentPost={props.onCommentPost} />
        </div>
      ) : null}
    </div>
  )
}
