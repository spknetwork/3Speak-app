import './Uploader.css'

import DateTime from 'date-and-time'
import PromiseIpc from 'electron-promise-ipc'
import Fs from 'fs'
import * as IPFSHTTPClient from 'ipfs-http-client'
import randomstring from 'randomstring'
import React, { useEffect, useRef, useState } from 'react'
import { Button, Card, Col, Form, ProgressBar, Row, Tab, Tabs } from 'react-bootstrap'
import { NotificationManager } from 'react-notifications'

import { IPFS_HOST } from '../../common/constants'
import {
  bytesAsString,
  millisecondsAsString,
  secondsAsString,
} from '../../common/utils/unit-conversion.functions'
import DefaultThumbnail from '../assets/img/default-thumbnail.jpg'
import LoadingMessage from '../components/LoadingMessage'
import { FormUtils } from '../renderer_utils'
import { AccountService } from '../services/account.service'

export function UploaderView() {
  const videoUpload = useRef<any>()
  const thumbnailUpload = useRef<any>()
  const thumbnailPreview = useRef('')
  const publishForm = useRef()
  const hwaccelOption = useRef()
  const ipfs = useRef<any>()

  const [logData, setLogData] = useState([])
  const [videoSourceFile, setVideoSourceFile] = useState()
  const [encodingInProgress, setEncodingInProgress] = useState(false)
  const [progress, setProgress] = useState<any>({})
  const [statusInfo, setStatusInfo] = useState<any>({ progress: {} })
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState('')
  const [videoInfo, setVideoInfo] = useState<any>({
    path: null,
    size: 0,
    cid: null,
    language: '',
    duration: null,
  })
  const [thumbnailInfo, setThumbnailInfo] = useState({
    path: null,
    size: 0,
    cid: null,
  })
  const [startTime, setStartTime] = useState<number>()
  const [endTime, setEndTime] = useState<number>(0)
  const [publishReady, setPublishReady] = useState(false)
  const [blockedGlobalMessage, setBlockedGlobalMessage] = useState('')

  useEffect(() => {
    ipfs.current = IPFSHTTPClient.create({ host: IPFS_HOST })
  }, [])

  const caluclatePercentage = () => {
    return progress.percent / statusInfo.nstages + statusInfo.stage * (100 / statusInfo.nstages)
  }

  const normalizeSize = () => {
    const size = videoInfo.size + thumbnailInfo.size
    return bytesAsString(size)
  }

  const compileVideoCid = async () => {
    const videoCid = videoInfo.cid
    if (thumbnailInfo.cid) {
      const obj = await ipfs.current.object.stat(thumbnailInfo.cid)
      console.log(obj)
      console.log(thumbnailInfo)
      const output = await ipfs.current.object.patch.addLink(videoCid, {
        name: thumbnailInfo.path,
        size: thumbnailInfo.size,
        cid: thumbnailInfo.cid,
      })
      console.log(output)
      return output.toString()
    }
    return videoCid
  }

  /**
   * Note: example metadata https://hiveblocks.com/hive-181335/@taskmaster4450/tqxwimhy
   */
  const publish = async () => {
    const videoCid = await compileVideoCid()
    const formData = FormUtils.formToObj(new FormData(publishForm.current))
    let tags: string[] = []
    if (formData.tags) {
      tags = formData.tags.replace(/\s/g, '').split(',')
    }

    console.log(`thumbnail info`, thumbnailInfo)

    const sourceMap = []
    if (thumbnailInfo.path) {
      sourceMap.push({
        type: 'thumbnail',
        url: `ipfs://${videoCid}/${thumbnailInfo.path}`,
      })
    }

    if (videoInfo) {
      sourceMap.push({
        type: 'video',
        url: `ipfs://${videoCid}/${videoInfo.path}`,
        format: 'm3u8',
      })
    }
    const permlink = `speak-${randomstring
      .generate({
        length: 8,
        charset: 'alphabetic',
      })
      .toLowerCase()}`
    //     console.log(permlink)
    console.log(`source map`)
    console.log(sourceMap)
    //     console.log(videoInfo)
    //     console.log(typeof formData.description)
    //     console.log(videoCid)
    setBlockedGlobalMessage('Publishing')

    const filesize = videoInfo.size + thumbnailInfo.size

    console.log(`formdata is `, formData)

    formData.title = formData.title || 'no form data'
    formData.description = formData.description || 'no form data'

    console.log(`publish form is `, publishForm.current)

    try {
      const [reflink] = await AccountService.postComment({
        accountType: 'hive',
        title: formData.title,
        body: formData.description,
        permlink,
        tags,
        json_metadata: {
          title: formData.title,
          description: formData.description,
          tags,
          sourceMap,
          filesize,
          created: new Date(),
          lang: videoInfo.language,
          video: {
            duration: videoInfo.duration,
          },
          app: '3speak/app-beta',
          type: '3speak/video',
        },
      })

      setTimeout(() => {
        location.hash = `#/watch/${reflink}`
        setBlockedGlobalMessage('done')
      }, 15000)
    } catch (error) {
      console.error(`Error in postComment operation ${error.message}`)
      throw error
    }
  }

  const handleVideoSelect = async (e) => {
    const file = e.target.files[0]
    setVideoSourceFile(file.path)
    setLogData([...logData, `Selected: ${videoInfo.path}`])
  }

  const handleThumbnailSelect = async (e) => {
    console.log(`handling thumbnail selectr`)

    const file = e.target.files[0]
    const imgblob = URL.createObjectURL(file)
    const size = file.size

    console.log(`uploading file with size ${size}`)

    thumbnailPreview.current = imgblob

    const fileDetails = {
      path: e.target.files[0].name,
      content: e.target.files[0],
    }

    const ipfsOut = await ipfs.current.add(fileDetails, { pin: false })
    console.log(`setting thumbnail info to cid`, ipfsOut.cid.toString())

    setThumbnailInfo({
      size,
      path: `thumbnail.${file.type.split('/')[1]}`,
      cid: ipfsOut.cid.toString(),
    })
  }

  const handleStartEncode = async (event) => {
    event.preventDefault()
    if (videoSourceFile === null) {
      NotificationManager.error('No video source file selected')
      return
    }
    if (!Fs.existsSync(videoSourceFile)) {
      NotificationManager.error('Source file does not exist')
      return
    }
    setEncodingInProgress(true)
    setStartTime(new Date().getTime())
    setEndTime(null)

    const jobInfo = (await PromiseIpc.send('encoder.createJob', {
      sourceUrl: videoSourceFile,
      profiles: [
        {
          name: '1080p',
          size: '1920x1080',
        },
        {
          name: '720p',
          size: '1080x720',
        },
        {
          name: '480p',
          size: '720x480',
        },
      ],
      options: {
        hwaccel:
          hwaccelOption.current !== '' && hwaccelOption.current !== 'none'
            ? hwaccelOption.current
            : undefined,
      },
    } as any)) as any
    NotificationManager.success('Encoding Started.')

    let savePct = 0
    const progressTrack = async () => {
      const status = (await PromiseIpc.send('encoder.status', jobInfo.id)) as any

      console.log(`Encoder status: `, status)

      setProgress(status.progress || {})
      setStatusInfo(status)

      const val = caluclatePercentage()
      const diffPct = val - savePct
      savePct = val
      const pctPerSec = diffPct / 3
      const totalTimeRemaining = (100 - val) / pctPerSec

      setEstimatedTimeRemaining(secondsAsString(totalTimeRemaining))
      setEndTime(new Date().getTime())
    }

    const pid = setInterval(progressTrack, 3000)
    void progressTrack()

    const encodeOutput = (await PromiseIpc.send('encoder.getjoboutput', jobInfo.id)) as any
    console.log(`got encode output`)
    console.log(encodeOutput)

    setVideoInfo({
      size: encodeOutput.size,
      cid: encodeOutput.ipfsHash,
      path: encodeOutput.path,
      duration: Number(DateTime.parse(encodeOutput.duration, 'hh:mm:ss.SS', true)) / 1000,
    })

    clearInterval(pid)

    setEncodingInProgress(false)
    setEstimatedTimeRemaining(null)
    setEndTime(new Date().getTime())
    setPublishReady(true)

    NotificationManager.success('Encoding complete.')
  }

  if (blockedGlobalMessage) {
    return (
      <LoadingMessage
        loadingMessage={blockedGlobalMessage}
        subtitle="Note: you will need to keep the app open for your video to play for other users. A process called 'shunting' will be released in the future to relieve this issue."
      />
    )
  }

  return (
    <div style={{ width: '95%', marginRight: 'auto', marginLeft: 'auto' }}>
      <Row style={{ marginTop: '1.45rem' }}>
        <div>
          <div
            className="d-table-cell align-middle card dz-clickable"
            onClick={() => videoUpload.current.click()}
            style={{
              width: '4000px',
              textAlign: 'center',
              height: '150px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            Drop a file or click to start the upload <br />
            <p>
              Selected: <kbd>{videoSourceFile}</kbd>
            </p>
            <input
              accept="video/*"
              type="file"
              id="video"
              className="d-none"
              ref={videoUpload}
              onChange={handleVideoSelect}
            />
          </div>
        </div>
      </Row>
      <Row style={{ marginTop: '15px' }}>
        <Col xl={6} sm={12} style={{ paddingLeft: '0px' }}>
          <div className="card" style={{ padding: '10px' }}>
            <Form ref={publishForm.current}>
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control type="text" name="title"></Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <textarea className="form-control" name="description"></textarea>
              </Form.Group>
              <Form.Group>
                <Form.Label>Tags</Form.Label>
                <Form.Control type="text" name="tags"></Form.Control>
                <small className="text-muted">
                  Separate multiple tags with a <kbd>,</kbd>{' '}
                </small>
              </Form.Group>
              <Form.Group>
                <Form.Label>Language</Form.Label>
                <select disabled={false} name="language" className="form-control mb-4">
                  <option selected={false} value="en">
                    English
                  </option>
                  <option value="de">Deutsch</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                  <option value="nl">Nederlands</option>
                  <option value="ko">한국어</option>
                  <option value="ru">русский</option>
                  <option value="hu">Magyar</option>
                  <option value="ro">Română</option>
                  <option value="cs">čeština</option>
                  <option value="pl">Polskie</option>
                  <option value="in">bahasa Indonesia</option>
                  <option value="bn">Bangla</option>
                  <option value="it">Italian</option>
                </select>
              </Form.Group>
              <span className="form-check mb-3">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="nsfwContent"
                  name="nsfwContent"
                />
                <label className="form-check-label" htmlFor="nsfwContent">
                  Content is graphic and/or NSFW
                  <span className="text-danger">
                    &nbsp;Warning: you should check this option if your content is&nbsp;
                    <a href="https://en.wikipedia.org/wiki/Not_safe_for_work">NSFW</a>.
                  </span>
                </label>
              </span>
              <Form.Group>
                <Form.Label>Thumbnail</Form.Label>
                <div></div>
                <img
                  src={thumbnailPreview.current || DefaultThumbnail}
                  style={{
                    width: '720px',
                    aspectRatio: '16/9',
                    cursor: 'pointer',
                  }}
                  alt=""
                  onClick={() => thumbnailUpload.current.click()}
                />
                <input
                  accept="image/*"
                  type="file"
                  id="thumbnail_input"
                  className="d-none"
                  ref={thumbnailUpload}
                  onChange={handleThumbnailSelect}
                />
                <p>Click the thumbnail to change it</p>
                <p>Recommended 5MB. Ideally 1280px×720px.</p>
              </Form.Group>
              <Button onClick={handleStartEncode}>Start Encode</Button>
              <Button
                style={{ marginLeft: '5px' }}
                onClick={publish}
                disabled={encodingInProgress || !publishReady}
              >
                Publish
              </Button>
            </Form>
          </div>
        </Col>
        <Col style={{ paddingRight: '0px', paddingLeft: '0px' }}>
          <Card>
            <Card.Header>Encoder status</Card.Header>
            <Card.Body>
              <Card.Text>This area will show live encoding statistics</Card.Text>
              <Button style={{ marginBottom: '5px' }} variant="primary">
                FPS: {progress.currentFps}
              </Button>{' '}
              <br />
              <Button variant="primary">Video Size: {normalizeSize()}</Button>
              <ProgressBar
                style={{
                  display: encodingInProgress ? '' : 'none',
                }}
                striped
                variant="success"
                now={caluclatePercentage()}
                label={progress.percent ? `${Math.round(caluclatePercentage())}%` : null}
              />
              <div
                style={{
                  display: encodingInProgress ? '' : 'none',
                }}
              >
                Time Remaining:{' '}
                {estimatedTimeRemaining !== 'NaNns' ? estimatedTimeRemaining : 'Calculating'}
              </div>
              <div style={{ display: endTime ? '' : 'none' }}>
                Total Time (so far):{' '}
                {endTime !== 0 ? millisecondsAsString(endTime - startTime) : 'Calculating'}
              </div>
            </Card.Body>
          </Card>
          <div className="card" style={{ marginTop: '15px' }}>
            <div className="card-header">
              <h5>Control Panel</h5>
            </div>
            <Tabs style={{ background: 'white' }} defaultActiveKey="encode">
              <Tab
                style={{ background: 'white', padding: '10px' }}
                eventKey="encode"
                title="Encode Settings"
              >
                <Form.Group>
                  <Form.Label>
                    <strong>Format</strong>
                  </Form.Label>
                  <select
                    style={{ width: '6em' }}
                    disabled={encodingInProgress}
                    id="language"
                    className="form-control mb-4"
                  >
                    <option selected={false} value="hls">
                      HLS
                    </option>
                  </select>
                </Form.Group>
                <Form.Group>
                  <Form.Label>
                    <strong>Hardware Accel</strong>
                  </Form.Label>
                  <Form.Text>
                    Use hardware acceleration to speed up video encode. Not available on all
                    systems, results may vary.
                  </Form.Text>
                  <select
                    style={{ width: '6em' }}
                    ref={hwaccelOption}
                    disabled={encodingInProgress}
                    id="language"
                    className="form-control mb-4"
                  >
                    <option selected={false} value="none">
                      none
                    </option>
                    <option value="qsv">QSV</option>
                    <option value="nvenc">nvenc</option>
                  </select>
                </Form.Group>
              </Tab>
              <Tab eventKey="info" title="Info" style={{ padding: '10px' }}>
                <Form.Group>
                  <Form.Label>Video IpfsPath</Form.Label>
                  <Form.Control
                    type="text"
                    name="vidoeHash"
                    disabled
                    value={videoInfo.cid}
                  ></Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Thumbnail IpfsPath</Form.Label>
                  <Form.Control
                    type="text"
                    name="thumbnailHash"
                    disabled
                    value={thumbnailInfo.cid}
                  ></Form.Control>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Total Size</Form.Label>
                  <Form.Control
                    style={{ width: '15%' }}
                    type="text"
                    name="videoSize"
                    value={normalizeSize()}
                    disabled
                  ></Form.Control>
                </Form.Group>
              </Tab>
              {/*<Tab eventKey="networks" title="Networks">
                                <Table striped bordered hover size="sm">
                                    <thead>
                                        <tr>
                                            <th>Enabled</th>
                                            <th>ID</th>
                                            <th>Username</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td><Form.Check/></td>
                                            <td>Hive</td>
                                            <td>vaultec</td>
                                        </tr>
                                    </tbody>
                                </Table>
                                
                            </Tab>*/}

              <Tab eventKey="log" title="Log" style={{ padding: '10px' }}>
                <textarea
                  disabled
                  className="form-control"
                  value={(() => logData.join('\n'))()}
                ></textarea>
              </Tab>
            </Tabs>
          </div>
        </Col>
      </Row>
    </div>
  )
}
