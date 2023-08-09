import React, { useEffect, useState } from 'react'
import { Container, Col, Row } from 'react-bootstrap'
import { FollowWidget } from '../../components/widgets/FollowWidget'
import { FaDownload } from 'react-icons/fa'
import { CollapsibleText } from '../../components/CollapsibleText'
import ReactMarkdown from 'react-markdown'
import { BsInfoSquare } from 'react-icons/bs'
import { CommentSection } from '../../components/video/CommentSection'
import { VideoTeaser } from '../../components/video/VideoTeaser'
import { Player } from '../../components/video/Player'
import { LoopCircleLoading } from 'react-loadingg'
import DateTime from 'date-and-time'
import DOMPurify from 'dompurify'
import rehypeRaw from 'rehype-raw'
import { usePinningUtils } from '../PinsView/pinningUtils'
export const WatchViewContent = (props: any) => {
  const [currentViewIsPinned, setCurrentViewIsPinned] = useState(false)

  const {
    loaded,
    videoInfo,
    postInfo,
    profilePictureURL,
    rootCid,
    reflinkParsed,
    recommendedVideos,
    PinLocally,
    showDebug,
    DHTProviders,
    VoteWidget,
    FollowWidget,
    CollapsibleText,
    CommentSection,
    VideoTeaser,
    CustomToggle,
    Dropdown,
    gearSelect,
    loadingMessage,
    reflink,
    Finder,
  } = props

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  const { pinList } = usePinningUtils()

  useEffect(() => {
    checkPins()
  }, [pinList, rootCid])
  const checkPins = () => {
    let pins = pinList.flatMap((obj) => obj.cids)

    if (pins.includes(rootCid)) {
      setCurrentViewIsPinned(true)
    } else {
      setCurrentViewIsPinned(false)
    }
  }
  return (
    <div>
      {loaded ? (
        <Container fluid>
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
                    <div style={{ textAlign: 'center' }}>
                      {currentViewIsPinned ? (
                        <button
                          style={{ marginRight: '5px', marginLeft: '5px' }}
                          className="btn btn-light btn-sm"
                          disabled={currentViewIsPinned}
                        >
                          {'Downloaded on IPFS'}
                        </button>
                      ) : (
                        <a
                          target="_blank"
                          style={{ marginRight: '5px', marginLeft: '5px' }}
                          className="btn btn-light btn-sm"
                          onClick={async () => {
                            setCurrentViewIsPinned(true)
                            await PinLocally()
                            checkPins()
                          }}
                        >
                          <FaDownload /> Download to IPFS node
                        </a>
                      )}

                      <div>{formatBytes(videoInfo.size)}</div>
                    </div>
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
                  <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                    {DOMPurify.sanitize(videoInfo.description)}
                  </ReactMarkdown>
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
                            <a href={`#/tag/hive:${tag}`}>{tag}</a>
                          </span>,
                        )
                      }
                    }
                    return out
                  })()}
                </p>
              </div>
              {/* <CommentSection reflink={reflink.toString()} /> */}
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
