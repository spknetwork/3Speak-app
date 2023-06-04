import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import RefLink from '../../main/RefLink';
import EmptyProfile from '../assets/img/EmptyProfile.png';
import { IPFS_HOST } from '../../common/constants';
import { CollapsibleText } from '../components/CollapsibleText';
import { FollowWidget } from '../components/widgets/FollowWidget';
import { VoteWidget } from '../components/video/VoteWidget';
import { CommentSection } from '../components/video/CommentSection';
import { VideoTeaser } from '../components/video/VideoTeaser';
import { WatchViewContent } from './WatchView/WatchViewContent';
import { DHTProviders } from '../../components/DHTProviders';
import { CustomToggle } from '../../components/CustomToggle';
import ArraySearch from 'arraysearch';
import * as IPFSHTTPClient from 'ipfs-http-client';
import { generalFetch } from './WatchView/watchViewHelpers/generalFetch';
import { mountPlayer } from './WatchView/watchViewHelpers/mountPlayer';
import { recordView } from './WatchView/watchViewHelpers/recordView';
import { gearSelect } from './WatchView/watchViewHelpers/gearSelect';
import { retrieveRecommended } from './WatchView/watchViewHelpers/retrieveRecommended';
import { PinLocally } from './WatchView/watchViewHelpers/PinLocally';
import { showDebug } from './WatchView/watchViewHelpers/showDebug';
const Finder = ArraySearch.Finder

let ipfsClient = IPFSHTTPClient.create({ url: IPFS_HOST })


export function WatchView(props: any) {
  const player = useRef<any>()
  const [videoInfo, setVideoInfo] = useState<any>({})
  const [postInfo, setPostInfo] = useState<any>({})
  const [profilePictureURL, setProfilePictureUrl] = useState(EmptyProfile)
  const [videoLink, setVideoLink] = useState('')
  const [recommendedVideos, setRecommendedVideos] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [rootCid, setRootCid] = useState('');

  const reflink = useMemo(() => {
    return props.match.params.reflink
  }, [])

  const reflinkParsed = useMemo(() => {
    return RefLink.parse(reflink) as any
  }, [reflink])
  useEffect(() => {
    const load = async () => {
      try {
        await generalFetch(
          reflink,
          setVideoInfo,
          setPostInfo,
          setProfilePictureUrl,
          setRootCid
        );
        setLoadingMessage('Loading: Mounting player...');
        await mountPlayer(reflink, setVideoLink, recordView);
      } catch (ex) {
        console.log(ex);
        setLoadingMessage('Loading resulted in error');
        throw ex;
      }
      setLoaded(true);
      await retrieveRecommended(postInfo, setRecommendedVideos);
    };
    void load();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const update = async () => {
      await generalFetch(reflink, setVideoInfo, setPostInfo, setProfilePictureUrl, setRootCid);
      await mountPlayer(reflink, setVideoLink, recordView);
      await retrieveRecommended(postInfo, setRecommendedVideos);
      player.current?.ExecUpdate();
    };
    console.log('Updating...');
    void update();
    console.log('Updated');
  }, [reflink]);

  return (
    <WatchViewContent
      loaded={loaded}
      videoInfo={videoInfo}
      postInfo={postInfo}
      profilePictureURL={profilePictureURL}
      rootCid={rootCid}
      reflink={reflink}
      reflinkParsed={reflinkParsed}
      recommendedVideos={recommendedVideos}
      loadingMessage={loadingMessage}
      Finder={Finder}
      PinLocally={() => PinLocally(videoInfo, reflink)}
      showDebug={showDebug}
      DHTProviders={DHTProviders}
      VoteWidget={VoteWidget}
      FollowWidget={FollowWidget}
      CollapsibleText={CollapsibleText}
      CommentSection={CommentSection}
      VideoTeaser={VideoTeaser}
      CustomToggle={CustomToggle}
      Dropdown={Dropdown}
      gearSelect={gearSelect}
    />
  )
}
