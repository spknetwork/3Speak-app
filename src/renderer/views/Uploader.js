import React, { Component } from 'react';
import { Container, Row, Col, Form, Nav, Button, Tab, Tabs, Card, ListGroup, ListGroupItem, ProgressBar } from 'react-bootstrap';
import './Uploader.css';
import DefaultThumbnail from '../assets/img/default-thumbnail.jpg';
import { NotificationManager } from 'react-notifications';
import Fs from 'fs';
import PromiseIpc from 'electron-promise-ipc'
import Convert from 'convert-units';
import utils from '../utils'

function NormaliseTime(val, unit) {
    return Math.round(Convert(val).from(unit).toBest().val) + Convert(val).from(unit).toBest().unit
}

class Uploader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logData: [],
            videoSourceFile: null,
            encodingInProgress: false,
            progress: {

            },
            statusInfo: {
                progress: {

                }
            },
            estimatedTimeRemaining: null,
            videoHash: null,
            startTime: null,
            endTime: null
        };

        this.thumbnailUpload = React.createRef();
        this.thumbnailPreview = React.createRef();
        this.videoUpload = React.createRef();
        this.handleThumbnailSelect = this.handleThumbnailSelect.bind(this);
        this.handleVideoSelect = this.handleVideoSelect.bind(this);
        this.handleStartEncode = this.handleStartEncode.bind(this);
    }
    caluclatePercentage() {
        return this.state.progress.percent/this.state.statusInfo.nstages + this.state.statusInfo.stage*(100/this.state.statusInfo.nstages);
    }
    normalizeSize() {
        var size = this.state.videoSize;
        if(this.state.videoSize) {
            return Math.round(Convert(size).from("B").toBest().val) + Convert(size).from("B").toBest().unit
        }
        return null;
    }
    async compileVideoHash() {
        var cid = this.state.videoHash;
    }
    async handleVideoSelect(e) {
        console.log(e.target.files[0])
        var videoInfo = e.target.files[0];
        var logData = this.state.logData;
        logData.push(`Selected: ${videoInfo.path}`)
        this.setState({
            videoSourceFile: videoInfo.path,
            logData
        })
    }
    async handleThumbnailSelect(e) {
        var imgblob = URL.createObjectURL(e.target.files[0]);
        this.thumbnailPreview.current.src = imgblob;
    }
    async handleStartEncode(event) {
        event.preventDefault();
        if (this.state.videoSourceFile === null) {
            NotificationManager.error("No video source file selected")
            return;
        }
        if (!Fs.existsSync(this.state.videoSourceFile)) {
            NotificationManager.error("Source file does not exist")
            return;
        }
        this.setState({
            encodingInProgress: true,
            startTime: new Date(),
            endTime: null
        })
        var jobInfo = await PromiseIpc.send("encoder.createJob", {
            sourceUrl: this.state.videoSourceFile,
            profiles: [
                {
                    name: "1080p",
                    size: "1920x1080"
                },
                {
                    "name": "720p",
                    size: "1080x720"
                },
                {
                    "name": "480p",
                    size: "720x480"
                }
            ],
            options: {
                hwaccel: "qsv"
            }
        })
        NotificationManager.success("Encoding Started.")

        var savePct = 0;
        var progressTrack = async() => {
            var status = await PromiseIpc.send("encoder.status", jobInfo.id);
            
            this.setState({
                progress: status.progress || {},
                statusInfo: status
            })
            var val = this.caluclatePercentage();
            var diffPct = val - savePct; savePct = val;
            var pctPerSec = diffPct/3;
            var totalTimeRemaining = (100-val)/pctPerSec
            console.log(`totalTimeRemain is ${totalTimeRemaining}`)
            this.setState({
                estimatedTimeRemaining: NormaliseTime(totalTimeRemaining, "s"),
                endTime: new Date()
            })
        }
        var pid = setInterval(progressTrack, 3000)
        progressTrack();

        var encodeOutput = await PromiseIpc.send("encoder.getjoboutput", jobInfo.id);
        console.log(encodeOutput)
        this.setState({
            videoSize: encodeOutput.size,
            videoHash: encodeOutput.playUrl
        })

        clearInterval(pid);
        this.setState({
            encodingInProgress: false,
            estimatedTimeRemaining: null,
            endTime: new Date()
        })
        NotificationManager.success("Encoding complete.")
    }
    async postComment() {
        const wif = ''; // posting key
        const parentAuthor = ''; // ideally empty for blog posts
        const parentPermlink = ''; // primary tag for the post
        const author = ''; // creator account
        const permlink = ''; // post permalink
        const title = ''; // post title
        const body = ''; // post body or description 
        const jsonMetadata = {tags: [''],  app: '' }
        const accountType = 'hive'

        const commentOp = {wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata, accountType}

        await utils.acctOps.postComment(commentOp)
    }
    render() {
        return (<div>
            <Row mt={3} mb={5}>
                <Container xl={6} sm={12}>
                    <div className="d-table-cell align-middle card dz-clickable" onClick={() => this.videoUpload.current.click()} style={{ width: "4000px", textAlign: "center", height: "150px", "fontSsize": "16px", fontWeight: "bold", cursor: "pointer" }}>
                        Drop a file or click to start the upload <br />
                        <p>
                            Selected: <kbd>{this.state.videoSourceFile}</kbd>
                        </p>
                        <input accept="video/*" type="file" id="video" className="d-none" ref={this.videoUpload} onChange={this.handleVideoSelect} />
                    </div>
                </Container>
            </Row>
            <Row mt={3} mb={5}>
                <Col xl={6} sm={12}>
                    <div className="card">
                        <Form>
                            <Form.Group>
                                <Form.Label>
                                    Title
                                    </Form.Label>
                                <Form.Control type="text" name="title">

                                </Form.Control>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>
                                    Description
                                </Form.Label>
                                <textarea className="form-control" type="text" name="title">

                                </textarea>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>
                                    Tags
                                    </Form.Label>
                                <Form.Control type="text" name="title">

                                </Form.Control>
                                <small className="text-muted">Separate multiple tags with a <kbd>,</kbd> </small>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>
                                    Language
                                </Form.Label>
                                <select disabled="" name="language" className="form-control mb-4">
                                    <option selected="" value="en">English</option>
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
                                <input type="checkbox" className="form-check-input" id="nsfwContent" />
                                <label className="form-check-label" for="nsfwContent">
                                    Content is graphic and/or NSFW
                                <span className="text-danger">
                                        Warning: you should check this option if your content is
                                    <a href="https://en.wikipedia.org/wiki/Not_safe_for_work">
                                        NSFW
                                    </a>.
                                </span>
                                </label>
                            </span>
                            <Form.Group>
                                <Form.Label>
                                    Thumbnail
                                </Form.Label>
                                <div>
                                </div>
                                <img src={DefaultThumbnail} style={{ width: "720px", height: "405px", cursor: "pointer" }} alt="" ref={this.thumbnailPreview} onClick={() => this.thumbnailUpload.current.click()} />
                                <input accept="image/*" type="file" id="thumbnail_input" className="d-none" ref={this.thumbnailUpload} onChange={this.handleThumbnailSelect} />
                                <p>Click the thumbnail to change it</p>
                                <p>Maximum 350kb. Ideally 1280px×720px.</p>
                            </Form.Group>
                            <Button type="submit" onClick={this.handleStartEncode}>
                                Start Encode
                            </Button>
                        </Form>
                    </div>
                </Col>
                <Col>
                    <Card>
                        <Card.Header>Featured</Card.Header>
                        <Card.Body>
                            <Card.Title>Encoder status</Card.Title>
                            <Card.Text>
                                This area will show live encoding statistics
                            </Card.Text>
                            <Button dvariant="primary">FPS: {this.state.progress.currentFps}</Button> <br />
                            <Button dvariant="primary">Video Size: {this.normalizeSize()}</Button>
                            <ProgressBar style={{display: this.state.encodingInProgress ? "" : "none"}} striped variant="success" now={this.caluclatePercentage()} label={this.state.progress.percent ? `${Math.round(this.caluclatePercentage())}%` : null} />
                            <div style={{display: this.state.encodingInProgress ? "" : "none"}} >
                                Time Remaining: {this.state.estimatedTimeRemaining !== "NaNns" ? this.state.estimatedTimeRemaining : "Calculating"}
                            </div>
                            <div style={{display: this.state.endTime ? "" : "none"}}>
                                Total Time (so far): {this.state.endTime !== "NaNns" ? NormaliseTime(this.state.endTime - this.state.startTime, "ms") : "Calculating"}
                            </div>
                        </Card.Body>
                    </Card>
                    <div className="card">
                        <Tabs style={{ background: "white" }} defaultActiveKey="encode">
                            <Tab style={{ background: "white" }} eventKey="encode" title="Encode Settings">
                                <Form.Group>
                                    <Form.Label>
                                        <strong>Format</strong>
                                    </Form.Label>
                                    <select style={{ width: "6em" }} disabled={this.state.encodingInProgress} id="language" className="form-control mb-4">
                                        <option selected="" value="hls">HLS</option>
                                    </select>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>
                                        <strong>Hardware Accel</strong>
                                    </Form.Label>
                                    <Form.Text>
                                        Use hardware acceleration to speed up video encode. Not available on all systems, results may vary.
                                    </Form.Text>
                                    <select style={{ width: "6em" }} disabled={this.state.encodingInProgress} id="language" className="form-control mb-4">
                                        <option selected="" value="none">none</option>
                                        <option value="qsv">QSV</option>
                                        <option value="nvenc">nvenc</option>
                                    </select>
                                </Form.Group>
                            </Tab>
                            <Tab eventKey="info" title="Info">
                                <Form.Group>
                                    <Form.Label>
                                        Video IpfsPath
                                    </Form.Label>
                                    <Form.Control type="text" name="vidoeHash" disabled value={this.state.videoHash}></Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>
                                        Thumbnail IpfsPath
                                    </Form.Label>
                                    <Form.Control type="text" name="thumbnailHash" disabled></Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>
                                        Total Size
                                    </Form.Label>
                                    <Form.Control style={{ width: "15%" }} type="text" name="videoSize" value={this.normalizeSize()}disabled></Form.Control>
                                </Form.Group>
                            </Tab>
                            <Tab eventKey="log" title="Log">
                                <textarea disabled className="form-control" type="text" value={(() => this.state.logData.join("\n"))()}>
                                </textarea>
                            </Tab>
                        </Tabs>
                    </div>
                </Col>
            </Row>
        </div>);
    }
}

export default Uploader;