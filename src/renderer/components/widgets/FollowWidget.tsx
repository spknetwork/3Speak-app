import React, { useEffect, useMemo, useState } from 'react'
import { Button } from 'react-bootstrap'
import { NotificationManager } from 'react-notifications'

import RefLink from '../../../main/RefLink'
import { AccountService } from '../../services/account.service'

export function FollowWidget(props: any) {
  const [followers, setFollowers] = useState(0)
  const reflink = useMemo(() => {
    return RefLink.parse(props.reflink)
  }, [props.reflink])

  const [alreadyFollowing, setAlreadyFollowing] = useState(false)

  const loadAlreadyFollowing = async () => {
    const out = await AccountService.getFollowing()
    const whoFollow = reflink.root

    for (const ln of Object.values(out)) {
      if (whoFollow === ln.following) {
        setAlreadyFollowing(true)
        break
      }
    }
  }

  const loadFollowers = async () => {
    setFollowers(await AccountService.getFollowerCount(props.reflink))
  }

  useEffect(() => {
    void loadFollowers()
    void loadAlreadyFollowing()
  }, [])

  const handleFollow = async () => {
    const profileID = localStorage.getItem('SNProfileID')

    if (profileID) {
      try {
        // const profile = await AccountService.getAccount(profileID)
        const accountType = 'hive'
        const author = RefLink.parse(props.reflink).root // person to follow
        const what = 'blog'
        const followOp = { author, accountType, what }
        await AccountService.followHandler(profileID, followOp)
        NotificationManager.success('User followed')

        setAlreadyFollowing(true)
      } catch (error) {
        console.error(error)
        NotificationManager.error('There was an error completing this operation')
      }
    } else {
      NotificationManager.error('You need to be logged in to perform this operation')
    }
  }

  const handleUnfollow = async () => {
    const profileID = localStorage.getItem('SNProfileID')

    if (profileID) {
      try {
        const accountType = 'hive'
        const author = RefLink.parse(props.reflink).root // person to follow

        const what = null
        const followOp = { author, accountType, what }
        await AccountService.followHandler(profileID, followOp)
        NotificationManager.success('User unfollowed')
      } catch (error) {
        console.error(error)
        NotificationManager.error('There was an error completing this operation')
      }
      setAlreadyFollowing(false)
    } else {
      NotificationManager.error('You need to be logged in to perform this operation')
    }
  }

  return (
    <div>
      {alreadyFollowing ? (
        <Button
          variant="light"
          size="sm"
          onClick={() => {
            void handleUnfollow()
          }}
        >
          <span>Unfollow</span>
        </Button>
      ) : (
        <Button
          variant="light"
          size="sm"
          onClick={() => {
            void handleFollow()
          }}
        >
          <span>Follow</span>
          <strong>
            <a
              href={`#/user/${reflink.root}/followers`}
              className="view-followers"
              title="Click to see followers"
            >
              {followers}
            </a>
          </strong>
        </Button>
      )}
    </div>
  )
}
