import React from 'react';
import { Container, Col, Row } from 'react-bootstrap';
import { FollowWidget } from '../../components/widgets/FollowWidget'
import { FaDownload } from 'react-icons/fa'
import { CollapsibleText } from '../../components/CollapsibleText'
import ReactMarkdown from 'react-markdown'
import { BsInfoSquare } from 'react-icons/bs'
import { CommentSection } from '../../components/video/CommentSection'
import { VideoTeaser } from '../../components/video/VideoTeaser'
import { Player } from '../../components/video/Player';
import { LoopCircleLoading } from 'react-loadingg'
import DateTime from 'date-and-time'
import DOMPurify from 'dompurify'
export const WatchViewContent = (props: any) => {
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
  } = props;

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
  );
};
