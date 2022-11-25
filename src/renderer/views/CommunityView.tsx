import axios from 'axios'
import codes, { by639_1 } from 'iso-language-codes'
import React, { useEffect, useMemo, useState } from 'react'
import { Tab, Tabs } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'

import RefLink from '../../main/RefLink'
import { AccountService } from '../services/account.service'
import { GridFeedView } from './GridFeedView'
import { useLatestCommunityFeed, useTrendingCommunityFeed } from '../components/hooks/Feeds'

const { Client: HiveClient } = require('@hiveio/dhive')
const client = new HiveClient('https://api.openhive.network')

export function CommunityView(props: any) {
  const [communityInfo, setCommunityInfo] = useState({} as any)
  // const [newVideos, setNewVideos] = useState([])
  // const [trendingVideos, setTrendingVideos] = useState([])
  const reflink = useMemo(() => {
    return RefLink.parse(props.match.params.reflink)
  }, [props.match])

  const newVideos = useLatestCommunityFeed(reflink.root)
  const trendingVideos = useTrendingCommunityFeed(reflink.root)
  const [backgroundUrl, setBackgroundUrl] = useState(null)


  // for development purpouses:

  const generate = async () => {
    const commInfo = await client.call('bridge', 'get_community', {
      name: reflink.root,
      observer: 'alice',
    })
    setCommunityInfo(commInfo)
    // const trendingVideosRes = (
    //   await axios.get(`https://3speak.tv/apiv2/feeds/community/${reflink.root}/trending`)
    // ).data
    // const newVideosRes = (
    //   await axios.get(`https://3speak.tv/apiv2/feeds/community/${reflink.root}/new`)
    // ).data
    // setTrendingVideos(trendingVideosRes)
    // setNewVideos(newVideosRes)
    const bgUrlRes = await AccountService.getProfileBackgroundImageUrl(props.match.params.reflink)
    setBackgroundUrl(bgUrlRes)
  }

  useEffect(() => {
    void generate()
  }, [reflink])

  return (
    <div>
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          width: '100%',
          minHeight: '400px',
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          background: `url(${backgroundUrl})`,
        }}
      >
        <img
          className="channel-profile-img"
          style={{ position: 'absolute', bottom: '10px', left: '10px' }}
          alt=""
          src={`https://images.hive.blog/u/${reflink.root}/avatar`}
        />

        <h1 style={{ position: 'absolute', bottom: '10px', left: '150px' }}>
          <b
            style={{
              color: 'white',
              textShadow: '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            }}
          >
            {communityInfo.title}
          </b>
        </h1>
      </div>
      <h4 className="mt-3">
        <ReactMarkdown>
          {communityInfo.about}
        </ReactMarkdown>
      </h4>
      <p>{communityInfo.description}</p>

      <hr />
      <Tabs>
        <Tab eventKey="videos" title="Videos" variant="secondary">
          <hr />
          <Tabs>
            <Tab eventKey="trending" title="Show Trending">
              <h3 id="videoSectionHeading">Trending Videos</h3>
              <hr />
              <div>
                {trendingVideos !== null ? (
                  <GridFeedView
                    key="community-trends"
                    community={reflink.root}
                    type={`community-trends`}
                    data={trendingVideos}
                  />
                ) : null}
              </div>
            </Tab>
            <Tab eventKey="new" title="Show New">
              <h3 id="videoSectionHeading">New Videos</h3>
              <hr />
              <div>
                {newVideos !== null ? (
                  <GridFeedView
                    key="community-new"
                    community={reflink.root}
                    type={`community-new`}
                    data={newVideos}
                  />
                ) : null}
              </div>
            </Tab>
          </Tabs>
        </Tab>
        <Tab eventKey="polls" title="Polls"></Tab>
        <Tab eventKey="stats" title="Stats">
          <div className="row">
            <div className="card col-lg-6 col-md-11 col-sm-12 col-xs-11 col-xl-5 ml-2 mt-2">
              <div className="card-header">
                <h3>More Info</h3>
              </div>
              <div className="card-body">
                <h5>
                  Language: {by639_1[communityInfo.lang] ? by639_1[communityInfo.lang].name : null}
                </h5>
                <h5>Community:</h5>
                <b className="text-success">{communityInfo.num_pending}</b> posts waiting to cash
                out
                <br />
                <b className="text-success">${communityInfo.sum_pending}</b> pending rewards
                <br />
                <b className="text-success">{communityInfo.subscribers}</b> subscribers
                <br />
                <p>
                  <b className="text-success">{communityInfo.num_authors}</b> active authors
                </p>
                <br />
                {communityInfo.is_nsfw === true ? (
                  <h5 className="text-danger">NSFW</h5>
                ) : (
                  <h5 className="text-success">Not NSFW</h5>
                )}
              </div>
            </div>
            <div className="card col-lg-6 col-md-8 col-sm-10 col-xs-11 col-xl-5 ml-2 mt-2">
              <div className="card-header">
                <h3>The team</h3>
              </div>
              <div className="card-body">
                <table className="table">
                  <thead>
                    <tr>
                      <td>User</td>
                      <td>Role</td>
                      <td>Nickname</td>
                    </tr>
                  </thead>
                  <tbody>
                    {communityInfo.team
                      ? communityInfo.team.map((value) => (
                          <tr key={value[0]}>
                            <td>
                              <a href={`#/user/hive:${value[0]}`}>{value[0]}</a>
                            </td>
                            <td>{value[1]}</td>
                            <td>{value[2]}</td>
                          </tr>
                        ))
                      : null}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  )
}
