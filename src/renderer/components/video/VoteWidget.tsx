import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ArraySearch from 'arraysearch'
import React, { useEffect, useMemo, useState } from 'react'
import { OverlayTrigger, Popover } from 'react-bootstrap'
import RangeSlider from 'react-bootstrap-range-slider'
import {
  FaChevronCircleDown,
  FaChevronCircleUp,
  FaThumbsDown,
  FaThumbsUp,
  FaTimesCircle,
} from 'react-icons/fa'
import { NotificationManager } from 'react-notifications'

import RefLink from '../../../main/RefLink'
import { AccountService } from '../../services/account.service'

const Finder = ArraySearch.Finder

export function VoteWidget(props: any) {
  const reflink = useMemo(() => {
    return RefLink.parse(props.reflink)
  }, [props.reflink])
  const author = useMemo(() => {
    return reflink.root
  }, [reflink])

  const permlink = useMemo(() => {
    return reflink.permlink
  }, [])

  const [downvoters, setDownvoters] = useState([])
  const [upvoters, setUpvoters] = useState([])
  const [upvotePct, setUpvotePct] = useState(0)
  const [downvotePct, setDownvotePct] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [showDModal, setShowDModal] = useState(false)

  const setVoters = () => {
    void AccountService.permalinkToPostInfo(props.reflink).then((post) => {
      const votes = post.active_votes.sort((e, i) => {
        return i.rshares - e.rshares
      })

      setDownvoters(votes.filter((vote) => vote.percent < 0))
      setUpvoters(votes.filter((vote) => vote.percent >= 0).reverse())
    })
  }

  useEffect(() => {
    setVoters()
  }, [])

  const handleClose = () => {
    setShowModal(false)
  }

  const handleShow = () => {
    setShowModal(true)
  }

  const handleDClose = () => {
    setShowDModal(false)
  }
  const handleDShow = () => {
    setShowDModal(true)
  }

  const handleVote = async () => {
    const modalState = showModal
    if (modalState === false) {
      handleShow()
    } else {
      const profileID = localStorage.getItem('SNProfileID')

      if (profileID) {
        try {
          const profile = (await AccountService.getAccount(profileID)) as any
          const theWifObj = Finder.one.in(profile.keyring).with({
            privateKeys: {},
          })
          const wif = theWifObj.privateKeys.posting_key // posting key
          const voter = profile.nickname // voting account
          const weight = upvotePct // vote weight in percentage(between 1 - 100)
          const accountType = 'hive'

          const voteOp = {
            wif,
            voter,
            author,
            permlink,
            weight,
            accountType,
            profileID,
          }

          await AccountService.voteHandler(voteOp)
          NotificationManager.success('Vote cast')
          const voterFmt = `@${voter}`
          setUpvoters([...upvoters, voterFmt])
          setShowModal(false)
          upvoters.push()
        } catch (error) {
          NotificationManager.success('There was an error completing this operation')
        }
      } else {
        NotificationManager.success('You need to be logged in to perform this operation')
      }
    }
  }

  const handleDownVote = async () => {
    const modalState = showDModal
    if (modalState === false) {
      handleDShow()
    } else {
      const profileID = localStorage.getItem('SNProfileID')

      if (profileID) {
        try {
          const profile = (await AccountService.getAccount(profileID)) as any
          const theWifObj = Finder.one.in(profile.keyring).with({
            privateKeys: {},
          })
          const wif = theWifObj.privateKeys.posting_key // posting key
          const voter = profile.nickname // voting account
          const weight = downvotePct * -1 // vote weight in percentage(between 1 - 100)
          const accountType = 'hive'

          const voteOp = {
            wif,
            voter,
            author,
            permlink,
            weight,
            accountType,
            profileID,
          }

          await AccountService.voteHandler(voteOp)

          NotificationManager.success('Vote casted, page will reload momentarily')
          setShowDModal(false)
        } catch (error) {
          NotificationManager.success('There was an error completing this operation')
        }
      } else {
        NotificationManager.success('You need to be logged in to perform this operation')
      }
    }
  }

  return (
    <>
      <span className="ml-2 p-0">
        <span style={{ cursor: 'pointer' }}>
          <FaThumbsUp
            className="text-secondary"
            onClick={() => {
              void handleVote()
            }}
          />
        </span>
        {showModal && (
          <span>
            <RangeSlider
              value={upvotePct}
              onChange={(evt) => {
                setUpvotePct(evt.target.value)
              }}
            />
            <FontAwesomeIcon
              size={'lg'}
              icon={(<FaChevronCircleUp style={{ cursor: 'pointer' }} />) as any}
            />
            <FontAwesomeIcon
              size={'lg'}
              icon={
                (<FaTimesCircle style={{ cursor: 'pointer' }} className="text-danger" />) as any
              }
            />
          </span>
        )}
      </span>
      <OverlayTrigger
        rootClose
        trigger="click"
        placement="bottom"
        overlay={
          <Popover id="popover-basic">
            <Popover.Title as="h3">
              Upvotes for @{author}/{permlink}
            </Popover.Title>
            <Popover.Content>
              {upvoters.slice(0, 10).map((e, index) => {
                return (
                  <div key={index}>
                    @{e.voter}: {e.percent / 100}%<br />
                  </div>
                )
              })}
              <a
                onClick={() => {
                  //todo: open modal
                }}
              >
                See more...
              </a>
            </Popover.Content>
          </Popover>
        }
      >
        <b style={{ cursor: 'pointer' }}>{upvoters.length}</b>
      </OverlayTrigger>

      <span className="ml-2 p-0">
        <span style={{ cursor: 'pointer' }}>
          <FaThumbsDown
            className="text-secondary"
            onClick={() => {
              void handleDownVote()
            }}
          />
        </span>
        {showDModal && (
          <span>
            <RangeSlider
              value={downvotePct}
              onChange={(changeEvent) => {
                setDownvotePct(changeEvent.target.value)
              }}
            />
            <FontAwesomeIcon
              size={'lg'}
              icon={(<FaChevronCircleDown style={{ cursor: 'pointer' }} />) as any}
            />
            <FontAwesomeIcon
              size={'lg'}
              icon={
                (<FaTimesCircle style={{ cursor: 'pointer' }} className="text-danger" />) as any
              }
            />
          </span>
        )}
      </span>
      <OverlayTrigger
        rootClose
        trigger="click"
        placement="bottom"
        overlay={
          <Popover id="basic-popover">
            <Popover.Title as="h3">
              Downvotes for @{author}/{permlink}
            </Popover.Title>
            <Popover.Content>
              {downvoters.slice(0, 10).map((item, index) => {
                return (
                  <div key={index}>
                    @{item.voter}: {item.percent / 100}%<br />
                  </div>
                )
              })}
              <a
                onClick={() => {
                  //todo: open modal
                }}
              >
                See more...
              </a>
            </Popover.Content>
          </Popover>
        }
      >
        <b style={{ cursor: 'pointer' }}>{downvoters.length}</b>
      </OverlayTrigger>
    </>
  )
}
