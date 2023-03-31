import ace from 'brace'
import 'brace/mode/json'
import 'brace/theme/github'
import 'jsoneditor-react/es/editor.min.css'

import ArraySearch from 'arraysearch'
import CID from 'cids'
import DateTime from 'date-and-time'
import Debug from 'debug'
import DOMPurify from 'dompurify'
import PromiseIpc from 'electron-promise-ipc'
import * as IPFSHTTPClient from 'ipfs-http-client'
import { JsonEditor as Editor } from 'jsoneditor-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Col, Container, Dropdown, Row, Tab, Tabs } from 'react-bootstrap'
import { BsInfoSquare } from 'react-icons/bs'
import { FaCogs, FaDownload, FaSitemap } from 'react-icons/fa'
import { LoopCircleLoading } from 'react-loadingg'
import ReactMarkdown from 'react-markdown'
import { NotificationManager } from 'react-notifications'
import Popup from 'react-popup'

import RefLink from '../../main/RefLink'
import EmptyProfile from '../assets/img/EmptyProfile.png'
import { Player } from '../components/video/Player'
import { IPFS_HOST } from '../../common/constants'
import { AccountService } from '../services/account.service'
import { VideoService } from '../services/video.service'
import { knex } from '../singletons/knex.singleton'
import { URL } from 'url'
import { CollapsibleText } from '../components/CollapsibleText'
import { FollowWidget } from '../components/widgets/FollowWidget'
import { VoteWidget } from '../components/video/VoteWidget'
import { CommentSection } from '../components/video/CommentSection'
import { VideoTeaser } from '../components/video/VideoTeaser'

const debug = Debug('3speak:watch')
const Finder = ArraySearch.Finder

let ipfsClient
try {
  ipfsClient = IPFSHTTPClient.create({ host: IPFS_HOST })
} catch (error) {
  console.error(`Error creating IPFS cliuent in watch.tsx: `, error)
  throw error
}
function DHTProviders(props) {
  const [peers, setPeers] = useState(0)
  useEffect(() => {
    void load()
    async function load() {
      if (!props.rootCid) {
        return
      }
      let out = 0
      for await (const pov of ipfsClient.dht.findProvs(props.rootCid)) {
        out = out + 1
        setPeers(out)
      }
      setPeers(out)
    }
  }, [])
  return (
    <div>
      <FaSitemap /> DHT Providers <strong>{peers}</strong>
    </div>
  )
}

const CustomToggle = React.forwardRef<any, any>(({ children, onClick }, ref) => (
  <button
    style={{ float: 'right' }}
    ref={ref}
    onClick={(e) => {
      e.preventDefault()
      onClick(e)
    }}
    className="btn btn-sm dropdown-toggle btn-secondary"
    id="videoOptions"
    type="button"
    data-toggle="dropdown"
  >
    <FaCogs />
  </button>
))

export function WatchView(props: any) {
  const player = useRef<any>()
  const [videoInfo, setVideoInfo] = useState<any>({})
  const [postInfo, setPostInfo] = useState<any>({})
  const [profilePictureURL, setProfilePictureUrl] = useState(EmptyProfile)
  const [commentGraph, setCommentGraph] = useState()
  const [videoLink, setVideoLink] = useState('')
  const [recommendedVideos, setRecommendedVideos] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [rootCid, setRootCid] = useState()

  const reflink = useMemo(() => {
    return props.match.params.reflink
  }, [])

  const reflinkParsed = useMemo(() => {
    return RefLink.parse(reflink) as any
  }, [reflink])

  const generalFetch = async () => {
    const info = await AccountService.permalinkToVideoInfo(reflink, { type: 'video' })
    setVideoInfo(info)
    setPostInfo(await AccountService.permalinkToPostInfo(reflink))
    try {
      //Leave profileURL default if error is thrown when attempting to retrieve profile picture
      setProfilePictureUrl(await AccountService.getProfilePictureURL(reflink))
    } catch (ex) {
      console.error(ex)
      throw ex
    }
    document.title = `3Speak - ${info.title}`
    const cids = []
    for (const source of info.sources) {
      const url = new URL(source.url)
      try {
        new CID(url.host)
        cids.push(url.host)
      } catch {}
    }
    // console.log('video_info', info)
    // console.log(cids)
    setRootCid(cids[0])
  }

  const mountPlayer = async () => {
    try {
      const playerType = 'standard'
      switch (playerType) {
        case 'standard': {
          setVideoLink(await VideoService.getVideoSourceURL(reflink))
        }
      }
      recordView()
    } catch (ex) {
      console.error(ex)
    }
  }

  const recordView = async () => {
    return
    /*let cids = [];
        for(const source of videoInfo.sources) {
            const url = new (require('url').URL)(source.url)
            try {
                new CID(url.host)
                cids.push(url.host)
            } catch  {

            }
        }
        console.log(`CIDs to cache ${JSON.stringify(cids)}`)

        if(cids.length !== 0) {
            await PromiseIpc.send("pins.add", {
                _id: reflink,
                source: "Watch Page",
                cids,
                expire: (new Date().getTime()) + convert("1").from("d").to("ms"),
                meta: {
                    title: videoInfo.title
                }
            })
        }*/
  }

  const gearSelect = async (eventKey) => {
    switch (eventKey) {
      case 'mute_post': {
        await PromiseIpc.send('blocklist.add', reflinkParsed.toString())
        break
      }
      case 'mute_user': {
        await PromiseIpc.send(
          'blocklist.add',
          `${reflinkParsed.source.value}:${reflinkParsed.root}` as any,
        )
        break
      }
    }
  }

  const retrieveRecommended = async () => {
    const query = knex.raw(
      `SELECT TOP 25 x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND category LIKE '${postInfo.category}' ORDER BY NEWID()`,
    )
    const blob = []
    query.stream().on('data', async (val) => {
      if (await PromiseIpc.send('blocklist.has', `hive:${val.author}:${val.permlink}` as any)) {
        console.log(`${val.author} is blocked`)
        return
      }
      val.json_metadata = JSON.parse(val.json_metadata)
      //console.log(val)
      if (!val.json_metadata.video) {
        val.json_metadata.video = {
          info: {},
        }
      }
      let thumbnail
      if (val.json_metadata.sourceMap) {
        thumbnail = Finder.one.in(val.json_metadata.sourceMap).with({ type: 'thumbnail' }).url
        console.log(thumbnail)
      }
      blob.push({
        reflink: `hive:${val.author}:${val.permlink}`,
        created: val.created,
        author: val.author,
        permlink: val.permlink,
        tags: val.json_metadata.tags,
        title: val.title,
        duration: val.json_metadata.video.info.duration || val.json_metadata.video.duration,
        isIpfs: val.json_metadata.video.info.ipfs || thumbnail ? true : false,
        ipfs: val.json_metadata.video.info.ipfs,
        images: {
          ipfs_thumbnail: thumbnail
            ? `/ipfs/${thumbnail.slice(7)}`
            : `/ipfs/${val.json_metadata.video.info.ipfsThumbnail}`,
          thumbnail: `https://threespeakvideo.b-cdn.net/${val.permlink}/thumbnails/default.png`,
          poster: `https://threespeakvideo.b-cdn.net/${val.permlink}/poster.png`,
          post: `https://threespeakvideo.b-cdn.net/${val.permlink}/post.png`,
        },
        views: val.total_vote_weight ? Math.log(val.total_vote_weight / 1000).toFixed(2) : 0,
      })

      setRecommendedVideos(blob)
    })
    query.on('query-response', (ret, det, aet) => {
      console.log(ret, det, aet)
    })
    query.on('end', (err) => {
      console.log(err)
    })
    /*
        let ref = RefLink.parse(reflink)
        let data = (await axios.get(`https://3speak.tv/apiv2/recommended?v=${ref.root}/${ref.permlink}`)).data
        data.forEach((value => {
            let link = value.link.split("=")[1].split("/")
            value.reflink = `hive:${link[0]}:${link[1]}`
        }))*/
  }

  const PinLocally = async () => {
    const cids = []
    for (const source of videoInfo.sources) {
      const url = new URL(source.url)
      try {
        new CID(url.host)
        cids.push(url.host)
      } catch {}
    }

    debug(`CIDs to store ${JSON.stringify(cids)}`)
    if (cids.length !== 0) {
      NotificationManager.info('Pinning in progress')
      await PromiseIpc.send('pins.add', {
        _id: reflink,
        source: 'Watch Page',
        cids,
        expire: null,
        meta: {
          title: videoInfo.title,
        },
      } as any)
      NotificationManager.success(
        `Video with reflink of ${reflink} has been successfully pinned! Thank you for contributing!`,
        'Pin Successful',
      )
    } else {
      NotificationManager.warning('This video is not available on IPFS')
    }
  }
  const showDebug = () => {
    const metadata = videoInfo
    Popup.registerPlugin('watch_debug', async function () {
      this.create({
        content: (
          <div>
            <Tabs defaultActiveKey="meta" id="uncontrolled-tab-example">
              <Tab eventKey="meta" title="Metadata">
                <Editor value={metadata} ace={ace} theme="ace/theme/github"></Editor>
              </Tab>
            </Tabs>
          </div>
        ),
        buttons: {
          right: [
            {
              text: 'Close',
              className: 'success',
              action: function () {
                Popup.close()
              },
            },
          ],
        },
      })
    })
    Popup.plugins().watch_debug()
  }

  useEffect(() => {
    const load = async () => {
      try {
        await generalFetch()
        setLoadingMessage('Loading: Mounting player...')
        await mountPlayer()
      } catch (ex) {
        console.log(ex)
        setLoadingMessage('Loading resulted in error')
        throw ex
      }
      setLoaded(true)
      await retrieveRecommended()
    }

    void load()
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)

    const update = async () => {
      await generalFetch()
      await mountPlayer()
      await retrieveRecommended()
      player.current?.ExecUpdate()
    }

    void update()
  }, [reflink])

  return (
    <div>
      {loaded ? (
        <Container fluid>
          {/* <Container fluid pb={0}> */}
          {/* <Row fluid="md"> */}
          <Row>
            <Col md={8}>
              <div>
                <Player reflink={reflink}></Player>
              </div>
              <div className="single-video-title box mb-3 clearfix">
                <div className="float-left">
                  <h2 style={{ fontSize: '18px' }}>
                    <a>{videoInfo.title}</a>
                  </h2>
                  <DHTProviders rootCid={rootCid} />
                </div>
                <div
                  className="float-right"
                  style={
                    {
                      textAlign: 'right !important',
                      float: 'right !important',
                      display: 'inline-block !important',
                    } as any
                  }
                >
                  <span>
                    <VoteWidget reflink={reflink} />
                  </span>
                  <Dropdown onSelect={gearSelect} style={{ paddingTop: '10px' }}>
                    <Dropdown.Toggle
                      as={CustomToggle}
                      id="dropdown-custom-components"
                    ></Dropdown.Toggle>
                    <Dropdown.Menu>
                      <Dropdown.Item eventKey="mute_post">
                        <p style={{ color: 'red' }}>Mute Post</p>
                      </Dropdown.Item>
                      <Dropdown.Item eventKey="mute_user">
                        <p style={{ color: 'red' }}>Mute User</p>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
              <div className="single-video-author box mb-3">
                <div className="float-right">
                  <Row>
                    <FollowWidget reflink={reflink} />
                    <a
                      target="_blank"
                      style={{ marginRight: '5px', marginLeft: '5px' }}
                      className="btn btn-light btn-sm"
                      onClick={PinLocally}
                    >
                      <FaDownload /> Download to IPFS node
                    </a>
                    <a
                      target="_blank"
                      style={{ marginRight: '5px' }}
                      className="btn btn-light btn-sm"
                      href={(() => {
                        const videoSource = Finder.one.in(videoInfo.sources).with({
                          format: 'mp4',
                        })
                        if (videoSource) {
                          return videoSource.url
                        }
                      })()}
                    >
                      <FaDownload /> Download
                    </a>
                  </Row>
                </div>
                <img className="img-fluid" src={profilePictureURL} alt="" />
                <p>
                  <a href={`#/user/${reflinkParsed.source.value}:${reflinkParsed.root}`}>
                    <strong>{postInfo.author}</strong>
                  </a>
                </p>
                <small>
                  Published on{' '}
                  {(() => {
                    const pattern = DateTime.compile('MMMM D, YYYY')
                    return DateTime.format(new Date(videoInfo.creation), pattern)
                  })()}
                </small>
              </div>
              <div className="single-video-info-content box mb-3">
                <h6>About :</h6>
                <CollapsibleText>
                  <ReactMarkdown
                    skipHtml={false}
                  >{DOMPurify.sanitize(videoInfo.description)}</ReactMarkdown>
                  <hr />
                  <Container style={{ marginBottom: '10px', textAlign: 'center' }}>
                    <a
                      target="_blank"
                      style={{ marginRight: '5px' }}
                      className="btn btn-light btn-sm"
                      onClick={() => showDebug()}
                    >
                      <BsInfoSquare /> Debug Info
                    </a>
                  </Container>
                </CollapsibleText>
                <h6>Tags: </h6>
                <p className="tags mb-0">
                  {(() => {
                    const out = []
                    if (videoInfo.tags) {
                      for (const tag of videoInfo.tags) {
                        out.push(
                          <span style={{ paddingLeft: '3px' }} key={tag}>
                            <a>{tag}</a>
                          </span>,
                        )
                      }
                    }
                    return out
                  })()}
                </p>
              </div>
              <CommentSection reflink={reflink.toString()} />
            </Col>
            <Col md={4}>
              <Row>
                <Col md={12}>
                  {recommendedVideos.map((value) => (
                    <VideoTeaser key={value.reflink} reflink={value.reflink} />
                  ))}
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      ) : (
        <div>
          <LoopCircleLoading />
          <div
            style={{
              textAlign: 'center',
              margin: 'auto',
              position: 'absolute',
              left: '0px',
              right: '0px',
              top: '60%',
              bottom: '0px',
            }}
          >
            <h1 style={{ top: '60%', fontSize: '20px' }}>{loadingMessage}</h1>
          </div>
        </div>
      )}
    </div>
  )
}
