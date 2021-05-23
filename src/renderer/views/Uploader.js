import React, { Component } from 'react';
import { Container, Row, Col, Form, Nav, Button, Tab, Tabs, Card, ListGroup, ListGroupItem, ProgressBar, Table } from 'react-bootstrap';
import './Uploader.css';
import DefaultThumbnail from '../assets/img/default-thumbnail.jpg';
import { NotificationManager } from 'react-notifications';
import Fs from 'fs';
import PromiseIpc from 'electron-promise-ipc'
import Convert from 'convert-units';
import IPFSHTTPClient from 'ipfs-http-client'
import DateTime from 'date-and-time'
import randomstring from 'randomstring'

import Utils from '../utils'
import LoadingMessage from '../components/loadingMessage'

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
            videoInfo: {
                path: null,
                size: 0,
                cid: null
            },
            thumbnailInfo: {
                path: null,
                size: 0,
                cid: null
            },
            startTime: null,
            endTime: null,
            publishReady: false,
            blockedGlobalMessage: null
        };

        this.thumbnailUpload = React.createRef();
        this.thumbnailPreview = React.createRef();
        this.videoUpload = React.createRef();
        this.publishForm = React.createRef();
        this.hwaccelOption = React.createRef();
        this.handleThumbnailSelect = this.handleThumbnailSelect.bind(this);
        this.handleVideoSelect = this.handleVideoSelect.bind(this);
        this.handleStartEncode = this.handleStartEncode.bind(this);
        this.compileVideoCid = this.compileVideoCid.bind(this);
        this.publish = this.publish.bind(this);

        this.ipfs = new IPFSHTTPClient();
    }
    caluclatePercentage() {
        return this.state.progress.percent / this.state.statusInfo.nstages + this.state.statusInfo.stage * (100 / this.state.statusInfo.nstages);
    }
    normalizeSize() {
        var size = this.state.videoInfo.size + this.state.thumbnailInfo.size;
        return Math.round(Convert(size).from("B").toBest().val) + Convert(size).from("B").toBest().unit
    }
    async compileVideoCid() {
        var videoCid = this.state.videoInfo.cid;
        var thumbnailInfo = this.state.thumbnailInfo;
        if (thumbnailInfo.cid) {
            var obj = await this.ipfs.object.stat(thumbnailInfo.cid)
            console.log(obj);
            console.log(thumbnailInfo);
            var output = (await this.ipfs.object.patch.addLink(videoCid, {
                name: thumbnailInfo.path,
                size: thumbnailInfo.size,
                cid: thumbnailInfo.cid
            }))
            console.log(output)
            return output.toString()
        }
        return videoCid;
    }
    /**
     * Note: example metadata https://hiveblocks.com/hive-181335/@taskmaster4450/tqxwimhy
     */
    async publish() {
        const videoCid = await this.compileVideoCid();
        const formData = Utils.formToObj(new FormData(this.publishForm.current))
        let tags;
        if(formData.tags === "") {
            tags = []
        } else {
            tags = formData.tags.replace(/\s/g, '').split(",")
        }
        console.log(videoCid)
        console.log(formData)
        var sourceMap = [];
        if (this.state.thumbnailInfo.path) {
            sourceMap.push({
                type: "thumbnail",
                url: `ipfs://${videoCid}/${this.state.thumbnailInfo.path}`
            })
        }
        console.log(this.state.videoInfo)
        if (this.state.videoInfo) {
            sourceMap.push({
                type: "video",
                url: `ipfs://${videoCid}/${this.state.videoInfo.path}`,
                format: "m3u8"
            })
        }
        const permlink = `speak-${randomstring.generate({
            length: 8,
            charset: 'alphabetic'
        }).toLowerCase()}`;
        console.log(permlink)
        console.log(sourceMap)
        console.log(this.state.videoInfo)
        console.log(typeof formData.description)
        console.log(videoCid)
        this.setState({
            blockedGlobalMessage: "Publishing"
        })

        const filesize = this.state.videoInfo.size + this.state.thumbnailInfo.size;

        var [reflink] = await Utils.acctOps.postComment({
            accountType: "hive",
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
                lang: this.state.videoInfo.language,
                video: {
                    duration: this.state.videoInfo.duration
                },
                app: "3speak/app-beta",
                type: "3speak/video",
            }
        })
        console.log(reflink);
        setTimeout(() => { 
            location.hash = `#/watch/${reflink}`
            this.setState({
                blockedGlobalMessage: "done"
            })
        }, 15000)
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
        const file = e.target.files[0]
        var imgblob = URL.createObjectURL(file);
        const size = file.size
        console.log(file)

        this.thumbnailPreview.current.src = imgblob;

        const fileDetails = {
            path: e.target.files[0].name,
            content: e.target.files[0]
        }
        var ipfsOut = await this.ipfs.add(fileDetails, { pin: false })
        this.setState({
            thumbnailInfo: {
                size,
                path: `thumbnail.${file.type.split("/")[1]}`,
                cid: ipfsOut.cid.toString()
            },
        })
        console.log(this.state.thumbnailInfo)
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
        console.log(this.hwaccelOption.current.value)
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
                hwaccel: this.hwaccelOption.current.value !== ""  && this.hwaccelOption.current.value !== "none" ? this.hwaccelOption.current.value : undefined
            }
        })
        NotificationManager.success("Encoding Started.")

        var savePct = 0;
        var progressTrack = async () => {
            var status = await PromiseIpc.send("encoder.status", jobInfo.id);

            this.setState({
                progress: status.progress || {},
                statusInfo: status
            })
            var val = this.caluclatePercentage();
            var diffPct = val - savePct; savePct = val;
            var pctPerSec = diffPct / 3;
            var totalTimeRemaining = (100 - val) / pctPerSec
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
            videoInfo: {
                size: encodeOutput.size,
                cid: encodeOutput.ipfsHash,
                path: encodeOutput.path,
                duration: Number(DateTime.parse(encodeOutput.duration, 'hh:mm:ss.SS', true)) / 1000
            }
        })

        clearInterval(pid);
        this.setState({
            encodingInProgress: false,
            estimatedTimeRemaining: null,
            endTime: new Date(),
            publishReady: true
        })
        NotificationManager.success("Encoding complete.")
    }
    render() {
        if(this.state.blockedGlobalMessage) {
            return <LoadingMessage loadingMessage={this.state.blockedGlobalMessage}/>;
        }
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
                        <Form ref={this.publishForm} >
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
                                <textarea className="form-control" type="text" name="description">

                                </textarea>
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>
                                    Tags
                                    </Form.Label>
                                <Form.Control type="text" name="tags">

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
                                <input type="checkbox" className="form-check-input" id="nsfwContent" name="nsfwContent" />
                                <label className="form-check-label" for="nsfwContent">
                                    Content is graphic and/or NSFW
                                <span className="text-danger">
                                        &nbsp;Warning: you should check this option if your content is&nbsp;
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
                                <p>Recommended 5MB. Ideally 1280px×720px.</p>
                            </Form.Group>
                            <Button onClick={this.handleStartEncode}>
                                Start Encode
                            </Button>
                            <Button onClick={this.publish} disabled={this.state.encodingInProgress || !this.state.publishReady}>
                                Publish
                            </Button>
                        </Form>
                    </div>
                </Col>
                <Col>
                    <Card>
                        <Card.Header>Encoder status</Card.Header>
                        <Card.Body>
                            <Card.Text>
                                This area will show live encoding statistics
                            </Card.Text>
                            <Button dvariant="primary">FPS: {this.state.progress.currentFps}</Button> <br />
                            <Button dvariant="primary">Video Size: {this.normalizeSize()}</Button>
                            <ProgressBar style={{ display: this.state.encodingInProgress ? "" : "none" }} striped variant="success" now={this.caluclatePercentage()} label={this.state.progress.percent ? `${Math.round(this.caluclatePercentage())}%` : null} />
                            <div style={{ display: this.state.encodingInProgress ? "" : "none" }} >
                                Time Remaining: {this.state.estimatedTimeRemaining !== "NaNns" ? this.state.estimatedTimeRemaining : "Calculating"}
                            </div>
                            <div style={{ display: this.state.endTime ? "" : "none" }}>
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
                                    <select style={{ width: "6em" }} ref={this.hwaccelOption} disabled={this.state.encodingInProgress} id="language" className="form-control mb-4">
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
                                    <Form.Control type="text" name="vidoeHash" disabled value={this.state.videoInfo.cid}></Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>
                                        Thumbnail IpfsPath
                                    </Form.Label>
                                    <Form.Control type="text" name="thumbnailHash" disabled value={this.state.thumbnailInfo.cid}></Form.Control>
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>
                                        Total Size
                                    </Form.Label>
                                    <Form.Control style={{ width: "15%" }} type="text" name="videoSize" value={this.normalizeSize()} disabled></Form.Control>
                                </Form.Group>
                            </Tab>
                            {
                                /*<Tab eventKey="networks" title="Networks">
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
                                
                            </Tab>*/
                            }

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