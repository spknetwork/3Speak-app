// uploaderViewContent.tsx
import React from 'react';
import { Card, Col, Row, Button, Form, ProgressBar, Tabs, Tab } from 'react-bootstrap';
import DefaultThumbnail from '../../assets/img/default-thumbnail.jpg'
import { millisecondsAsString } from '../../../common/utils/unit-conversion.functions'
const UploaderViewContent = ({
                               videoSourceFile,
                               videoUpload,
                               handleVideoSelect,
                               setPublishFormTitle,
                               publishFormTitle,
                               setPublishFormDescription,
                               publishFormDescription,
                               setPublishFormTags,
                               publishFormTags,
                               thumbnailPreview,
                               thumbnailUpload,
                               progress,
                               handleThumbnailSelect,
                               handleStartEncode,
                               publish,
                               encodingInProgress,
                               publishReady,
                               normalizeSize,
                               calculatePercentage,
                               estimatedTimeRemaining,
                               endTime,
                               startTime,
                               hwaccelOption,
                               setHwaccelOption,
                               videoInfo,
                               thumbnailInfo,
                               logData,
                               statusInfo,
                             }) => {
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
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleVideoSelect}
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
            <Form>
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control
                  onChange={(e) => setPublishFormTitle(e.target.value)}
                  value={publishFormTitle}
                  type="text"
                  name="title"
                ></Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Description</Form.Label>
                <textarea
                  onChange={(e) => setPublishFormDescription(e.target.value)}
                  value={publishFormDescription}
                  className="form-control"
                  name="description"
                ></textarea>
              </Form.Group>
              <Form.Group>
                <Form.Label>Tags</Form.Label>
                <Form.Control
                  onChange={(e) => setPublishFormTags(e.target.value)}
                  value={publishFormTags}
                  type="text"
                  name="tags"
                ></Form.Control>
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
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleThumbnailSelect}
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
              <Button variant="primary">Video Size: {normalizeSize(videoInfo, thumbnailInfo)}</Button>
              <ProgressBar
                style={{
                  display: encodingInProgress ? '' : 'none',
                }}
                striped
                variant="success"
                now={calculatePercentage(progress, statusInfo)}
                label={progress.percent ? `${Math.round(calculatePercentage(progress, statusInfo))}%` : null}
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
                    value={hwaccelOption}
                    onChange={(e) => setHwaccelOption(e.target.value)}
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
                    value={normalizeSize(videoInfo, thumbnailInfo)}
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
export default UploaderViewContent;
