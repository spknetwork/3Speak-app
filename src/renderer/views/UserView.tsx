import React, { useEffect, useMemo, useState } from 'react';
import RefLink from '../../main/RefLink';
import '../css/User.css';
import { AccountService } from '../services/account.service';
import { IndexerClient } from '../App';
import { useQuery } from '@apollo/client';
import UserViewContent from './UserView/UserViewContent';
import { QUERY } from './UserView/userQueries';
import { transformGraphqlToNormal } from './UserView/userUtils';
/**
 * User about page with all the public information a casual and power user would need to see about another user.
 */
export function UserView(props: any) {
  const [profileAbout, setProfileAbout] = useState('')
  const [hiveBalance, setHiveBalance] = useState<number>()
  const [hbdBalance, setHbdBalance] = useState<number>()
  const [coverUrl, setCoverUrl] = useState('')
  const [profileUrl, setProfileUrl] = useState('')

  const reflink = useMemo(() => {
    return RefLink.parse(props.match.params.reflink)
  }, [props.match])

  const username = useMemo(() => {
    return reflink.root
  }, [reflink])

  const { data, loading } = useQuery(QUERY, {
    variables: {
      author: username
    },
    client: IndexerClient,
  })

  console.log(data)
  const videos = data?.latestFeed?.items || [];

  useEffect(() => {
    const load = async () => {
      const accountBalances = await AccountService.getAccountBalances(reflink)
      setProfileUrl(await AccountService.getProfilePictureURL(reflink))
      setProfileAbout(await AccountService.getProfileAbout(reflink))
      setHiveBalance(accountBalances.hive)
      setHbdBalance(accountBalances.hbd)
      setCoverUrl(await AccountService.getProfileBackgroundImageUrl(reflink))
    }

    void load()
  }, [reflink])

  return (
    <UserViewContent
      coverUrl={coverUrl}
      profileUrl={profileUrl}
      username={username}
      reflink={reflink}
      hiveBalance={hiveBalance}
      hbdBalance={hbdBalance}
      profileAbout={profileAbout}
    />
  );
}
