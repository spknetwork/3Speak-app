import 'brace/mode/json'
import 'brace/theme/github'
import 'jsoneditor-react/es/editor.min.css'

import ace from 'brace'
import CID from 'cids'
import DateTime from 'date-and-time'
import Debug from 'debug'
import PromiseIpc from 'electron-promise-ipc'
import { JsonEditor as Editor } from 'jsoneditor-react'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Col, Dropdown, Form, FormControl, Row, Table } from 'react-bootstrap'
import { NotificationManager } from 'react-notifications'
import Popup from 'react-popup'

import { IpfsHandler } from '../../main/core/components/ipfsHandler'
import RefLink from '../../main/RefLink'
import { FormUtils } from '../renderer_utils'
import { AccountService } from '../services/account.service'
import { CustomPinsViewMenu } from './PinsView/CustomMenu'
import { CustomPinsViewToggle } from './PinsView/CustomToggle'
import { bytesAsString, millisecondsAsString } from '../../common/utils/unit-conversion.functions'

const debug = Debug('3speak:pins')

export function PinsView() {
  const [pinList, setPinList] = useState([])
  const [newVideos, setNewVideos] = useState([])
  const [trendingVideos, setTrendingVideos] = useState([])
  const [showExplorer, setShowExplorer] = useState(false)

  const pid = useRef<any>()

  const updateSearchTables = (community = null, creator = null) => {
    const ids = pinList.map((x) => {
      return x._id
    })
    console.log(ids)
    const params = '?limit=10&ipfsOnly=true'
    let newUrl = `https://3speak.tv/apiv2/feeds/new${params}`
    let trendingUrl = `https://3speak.tv/apiv2/feeds/trending${params}`
    if (community) {
      newUrl = `https://3speak.tv/apiv2/feeds/community/${community}/new${params}`
      trendingUrl = `https://3speak.tv/apiv2/feeds/community/${community}/trending${params}`
    } else if (creator && creator.length > 2) {
      newUrl = `https://3speak.tv/apiv2/feeds/@${creator}`
      trendingUrl = null
    }

    fetch(newUrl)
      .then((r) => r.json())
      .then((r) => {
        for (const video of r) {
          const id = `hive:${video.author}:${video.permlink}`
          video.isPinned = ids.includes(id)
          video.id = id
        }
        console.log(r)
        setNewVideos(r)
      })

    if (!trendingUrl) {
      setTrendingVideos([])
    } else {
      fetch(trendingUrl)
        .then((r) => r.json())
        .then((r) => {
          for (const video of r) {
            const id = `hive:${video.author}:${video.permlink}`
            video.isPinned = ids.includes(id)
            video.id = id
          }
          setTrendingVideos(r)
        })
    }
  }

  const generate = async () => {
    // type error - 2 arguments expected
    setPinList(await PromiseIpc.send('pins.ls', undefined as any))
  }

  const PinLocally = async (cids, title, _id) => {
    debug(`CIDs to store ${JSON.stringify(cids)}`)
    if (cids.length !== 0) {
      NotificationManager.info('Pinning in progress')

      await PromiseIpc.send('pins.add', {
        _id,
        source: 'Pins page',
        cids,
        expire: null,
        meta: {
          title,
        },
      } as any)

      NotificationManager.success(
        `Video with title of ${title} has been successfully pinned! Thank you for contributing!`,
        'Pin Successful',
      )
    } else {
      NotificationManager.warning('This video is not available on IPFS')
    }
    await generate()
  }

  const actionSelect = async (key) => {
    console.log(key)
    switch (key) {
      case '1': {
        const func = () =>
          new Promise(async (resolve, reject) => {
            const ref = React.createRef() as any
            Popup.create({
              content: (
                <div>
                  <Form ref={ref}>
                    <Form.Label>Reflink</Form.Label>
                    <FormControl
                      name="reflink"
                      placeholder="hive:username:123permlink"
                    ></FormControl>
                  </Form>
                </div>
              ),
              buttons: {
                left: [
                  {
                    text: 'Cancel',
                    className: 'secondary',
                    action: function () {
                      Popup.close()
                    },
                  },
                ],
                right: [
                  {
                    text: 'Done',
                    className: 'success',
                    action: function () {
                      resolve(FormUtils.formToObj(new FormData(ref.current)))
                      Popup.close()
                    },
                  },
                ],
              },
            })
          })
        const ret = (await func()) as any
        const video_info = await AccountService.permalinkToVideoInfo(ret.reflink)
        const cids = []
        for (const source of video_info.sources) {
          const url = new (require('url').URL)(source.url)
          try {
            new CID(url.host)
            cids.push(url.host)
          } catch (ex) {
            console.error(ex)
          }
        }
        if (cids.length !== 0) {
          NotificationManager.info('Pinning in progress')
          await PromiseIpc.send('pins.add', {
            _id: ret.reflink,
            source: 'Manual Add',
            cids,
            expire: null,
            meta: {
              title: video_info.title,
            },
          } as any)
          NotificationManager.success(
            `Video with reflink of ${ret.reflink} has been successfully pinned! Thank you for contributing!`,
            'Pin Successful',
          )
        } else {
          NotificationManager.warning('This video is not available on IPFS')
        }
        break
      }
      case '2': {
        NotificationManager.info('GC has started')
        const { ipfs } = await IpfsHandler.getIpfs()
        ipfs.repo.gc()
        break
      }
      default: {
      }
    }
  }

  const removePin = async (reflink) => {
    try {
      await PromiseIpc.send('pins.rm', reflink)
      NotificationManager.success('IPFS pin removal complete')
      await generate()
    } catch (ex) {
      NotificationManager.error('IPFS pin removal resulted in error')
      console.error(ex)
    }
  }

  useEffect(() => {
    document.title = '3Speak - Tokenised video communities'
    void generate()
    pid.current = setInterval(generate, 1500)
    updateSearchTables()

    return () => {
      clearInterval(pid.current)
    }
  }, [])

  const pinRows = useMemo(() => {
    const rows = []
    for (const pin of pinList) {
      if(!pin.cids) {
        continue;
      }
      const sizeBest = bytesAsString(pin.size || 0)

      rows.push(
        <tr key={pin._id}>
          <td>
            <a href={`#/watch/${pin._id}`}>{pin._id}</a>
            <br />(<strong>{RefLink.parse(pin._id).root}</strong>)
          </td>
          <td>
            <a href={`#/watch/${pin._id}`}>{pin.meta ? pin.meta.title : null} </a>
          </td>
          <td>
            {pin.cids.length > 1 ? (
              <a
                onClick={() => {
                  Popup.create({
                    title: 'CIDs',
                    content: (
                      <div>
                        <Editor value={pin.cids} ace={ace} theme="ace/theme/github"></Editor>
                      </div>
                    ),
                    buttons: {
                      left: [],
                      right: [
                        {
                          text: 'close',
                          key: '⌘+s',
                          className: 'success',
                          action: function () {
                            Popup.close()
                          },
                        },
                      ],
                    },
                  })
                }}
              >
                View ({pin.cids.length})
              </a>
            ) : (
              pin.cids
            )}
          </td>
          <td>{pin.source}</td>
          <td>
            {pin.expire
              ? (() => {
                  console.log(pin.expire)
                  return 'In ' + millisecondsAsString((pin.expire = new Date().getTime()))
                })()
              : 'Permanent'}
          </td>
          <td>
            {pin.meta.pin_date
              ? (() => {
                  console.log(pin)
                  return new Date(pin.meta.pin_date).toLocaleString()
                })()
              : null}
          </td>
          <td>{pin.size === 0 ? <strong>Pinning In Progress ({pin.percent}%) </strong> : sizeBest}</td>
          <td>
            <Button variant="danger" onClick={() => removePin(pin._id)}>
              X
            </Button>
          </td>
        </tr>,
      )
    }
    return rows
  }, [pinList])

  return (
    <div>
      <Row>
        <Col style={{ textAlign: 'right' }}>
          <Dropdown onSelect={actionSelect}>
            <Dropdown.Toggle as={CustomPinsViewToggle} id="dropdown-custom-components">
              <Button>Actions</Button>
            </Dropdown.Toggle>

            <Dropdown.Menu as={CustomPinsViewMenu}>
              <Dropdown.Item eventKey="1">Manual Pin</Dropdown.Item>
              <Dropdown.Item eventKey="2">Manual GC</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Col>
      </Row>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Reflink</th>
            <th>Title</th>
            <th>CID(s)</th>
            <th>Source</th>
            <th>Expiration</th>
            <th>Pin Date</th>
            <th>Size/Status</th>
            <th>Remove?</th>
          </tr>
        </thead>
        <tbody>{pinRows}</tbody>
      </Table>
      <Button
        onClick={() => {
          setShowExplorer(!showExplorer)
        }}
      >
        Toggle pin explorer
      </Button>
      {showExplorer && (
        <>
          <h6>Select to pin and help secure the network by backing up videos</h6>
          <input
            type="text"
            placeholder="Enter community ID..."
            onChange={(event) => {
              if (event.target.value.match(/\bhive-\d{6}\b/g)) {
                updateSearchTables(event.target.value, null)
              }
            }}
          />
          <input
            type="text"
            placeholder="Enter a username"
            onChange={(event) => {
              updateSearchTables(null, event.target.value)
            }}
          />
          <Row>
            {['new', 'trending'].map((type: 'new' | 'trending') => (
              <Col key={type}>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>{type} videos</th>
                      <th>Title</th>
                      <th>Creator</th>
                      <th>pinned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* {this.state[`${type}Videos`].map((video) => ( */}
                    {(type === 'new' ? newVideos : trendingVideos).map((video) => (
                      <tr key={`${type}-${video.author}-${video.permlink}`}>
                        <td>
                          <div className="teaser_holder video-card-image">
                            <div className="card-label">
                              {(() => {
                                const pattern = DateTime.compile('mm:ss')
                                return DateTime.format(new Date(video.duration * 1000), pattern)
                              })()}
                            </div>
                            <a href={`#/watch/hive:${video.author}:${video.permlink}`}>
                              <img
                                className="img-fluid bg-dark"
                                src={video.images.thumbnail}
                                alt=""
                              />
                            </a>
                          </div>
                        </td>
                        <td>{video.title}</td>
                        <td>{video.author}</td>
                        <td>
                          {video.isPinned ? (
                            <Button
                              variant="danger"
                              onClick={async () => {
                                await removePin(video.id)
                                updateSearchTables()
                              }}
                            >
                              X
                            </Button>
                          ) : (
                            <Button
                              variant="success"
                              onClick={async () => {
                                await PinLocally([video.ipfs], video.title, video.id)
                                updateSearchTables()
                              }}
                            >
                              O
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  )
}
