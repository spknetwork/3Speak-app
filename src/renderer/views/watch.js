import React from 'react';
import Player from '../components/video/Player';
import { Col, Row, Container, Dropdown, Tabs, Tab } from 'react-bootstrap';
import utils from '../utils';
import { FaThumbsUp, FaThumbsDown, FaCogs, FaDownload } from 'react-icons/fa';
import { BsInfoSquare } from 'react-icons/bs';
import DateTime from 'date-and-time';
import ReactMarkdown from 'react-markdown';
import CollapsibleText from '../components/CollapsibleText';
import EmptyProfile from '../assets/img/EmptyProfile.png';
import VideoTeaser from '../components/video/VideoTeaser';
import CommentSection from '../components/video/CommentSection';
import Follow from "../components/widgets/Follow";
import RefLink from '../../main/RefLink'
import axios from 'axios';
import PromiseIpc from 'electron-promise-ipc'
import CID from 'cids'
import convert from 'convert-units';
import Debug from 'debug';
import {LoopCircleLoading} from 'react-loadingg';
import DOMPurify from 'dompurify';
import {NotificationManager} from 'react-notifications';
import Popup from 'react-popup';
import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import ace from 'brace';
import 'brace/mode/json';
import 'brace/theme/github';
const debug = Debug("blasio:watch")

class watch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            player: null,
            video_info: {},
            post_info: {},
            reflink: this.props.match.params.reflink,
            profilePictureURL: EmptyProfile,
            commentGraph: null,
            videoLink: "",
            recommendedVideos: [],
            loaded: false
        };
        this.player = React.createRef()
        this.gearSelect = this.gearSelect.bind(this);
        this.PinLocally = this.PinLocally.bind(this);
    }
    async componentDidMount() {
        console.log(this.state)
        await this.generalFetch() 
        await this.mountPlayer();
        this.setState({
            loaded: true
        })
        await this.retrieveRecommended()
    }
    componentDidUpdate(prevProps) {
        if (this.props.match.params.reflink !== prevProps.match.params.reflink) {
            // Handle path changes
            window.scrollTo(0, 0)
            this.setState({
                reflink: this.props.match.params.reflink
            }, async () => {
                await this.generalFetch() 
                await this.mountPlayer();
                await this.retrieveRecommended()
                this.player.current.ExecUpdate()
            })
        }
    }
    async generalFetch() {
        this.setState({
            video_info: await utils.accounts.permalinkToVideoInfo(this.state.reflink),
            post_info: await utils.accounts.permalinkToPostInfo(this.state.reflink)
        })
        try {
            //Leave profileURL default if error is thrown when attempting to retrieve profile picture
            this.setState({ profilePictureURL: await utils.accounts.getProfilePictureURL(this.state.reflink) })
        } catch (ex) {
            console.log(ex)
        }
        document.title = `3Speak - ${this.state.video_info.title}`
    }
    async mountPlayer() {
        try {
            var playerType = "standard";
            switch (playerType) {
                case "standard": {
                    this.setState({
                        videoLink: await utils.video.getVideoSourceURL(this.state.reflink)
                    })
                }
            }
            this.recordView();
        } catch(ex) {
            console.log(ex)
        }
    }
    async recordView() {
        let cids = [];
        for(const source of this.state.video_info.sources) {
            const url = new (require('url').URL)(source.url)
            try {
                new CID(url.host)
                cids.push(url.host)
            } catch  {

            }
        }
        debug(`CIDs to cache ${JSON.stringify(cids)}`)
        if(cids.length !== 0) {
            await PromiseIpc.send("pins.add", {
                _id: this.state.reflink,
                source: "Watch Page",
                cids,
                expire: (new Date() / 1) + convert("1").from("d").to("ms")
            })
        }
    }
    async gearSelect(eventKey) {
        var ref = RefLink.parse(this.state.reflink)
        switch(eventKey) {
            case "mute_post": {
                await PromiseIpc.send("blocklist.add", ref.toString())
                break;
            }
            case "mute_user": {
                await PromiseIpc.send("blocklist.add", `${ref.source.value}:${ref.root}`)
                break;
            }
        }
    }
    async retrieveRecommended() {
        var ref = RefLink.parse(this.state.reflink)
        var data = (await axios.get(`https://3speak.co/apiv2/recommended?v=${ref.root}/${ref.permlink}`)).data
        data.forEach((value => {
            var link = value.link.split("=")[1].split("/")
            value.reflink = `hive:${link[0]}:${link[1]}`
        }))
        this.setState({
            recommendedVideos: data
        })
    }
    async PinLocally() {
        let cids = [];
        for(const source of this.state.video_info.sources) {
            const url = new (require('url').URL)(source.url)
            try {
                new CID(url.host)
                cids.push(url.host)
            } catch {

            }
        }
        debug(`CIDs to store ${JSON.stringify(cids)}`)
        if(cids.length !== 0) {
            NotificationManager.info("Pinning in progress")
            await PromiseIpc.send("pins.add", {
                _id: this.state.reflink,
                source: "Watch Page",
                cids,
                expire: null
            })
            NotificationManager.success(`Video with reflink of ${this.state.reflink} has been successfully pinned! Thank you for contributing!`, "Pin Successful")
        } else {
            NotificationManager.warning("This video is not available on IPFS")
        }
    }
    async showDebug() {
        const metadata = this.state.video_info
        Popup.registerPlugin('watch_debug', async function () {
            this.create({
                content: <div>
                    <Tabs defaultActiveKey="meta" id="uncontrolled-tab-example">
                        <Tab eventKey="meta" title="Metadata">
                            <Editor value={metadata}
                            ace={ace}
                            theme="ace/theme/github">
                            </Editor>
                        </Tab>
                    </Tabs>
                    </div>,
                buttons: {
                    right: [{
                        text: 'Close',
                        className: 'success',
                        action: function () {
                            Popup.close();
                        }
                    }]
                }
            });
        })
        Popup.plugins().watch_debug();
    }
    render() {
        console.log(this.props);
        console.log(this.state.post_info)
        console.log(this.state.video_info)
        const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
            <button style={{ float: "right" }} ref={ref} onClick={(e) => {
                e.preventDefault();
                onClick(e);
            }} className="btn btn-sm dropdown-toggle btn-secondary" id="videoOptions" type="button" data-toggle="dropdown">
                <FaCogs />
            </button>
        ));

        var ref = RefLink.parse(this.state.reflink)
        return <div>
            {this.state.loaded ?
            <Container fluid pb={0}>
                <Row fluid="md">
                    <Col md={8}>
                        <div>
                            <Player ref={this.player} reflink={this.props.match.params.reflink}></Player>
                        </div>
                        <div className="single-video-title box mb-3 clearfix">
                            <div className="float-left">
                                <h2 style={{ fontSize: "18px" }}>
                                    <a>{this.state.video_info.title}</a>
                                </h2>
                            </div>
                            <div className="float-right" style={{ textAlign: "right !important", float: "right !important", display: "inline-block !important" }}>
                                <span>
                                    <span style={{ padding: "0 !important" }}>
                                        <FaThumbsUp style={{ color: "#d3d3d3" }} />
                                        {
                                            //TODO: Implement likes
                                        }
                                    </span>
                                    <span style={{ padding: "0 !important" }}>
                                        <FaThumbsDown style={{ color: "#d3d3d3" }} />
                                        {
                                            //TODO: Implement dislikes
                                        }
                                    </span>
                                </span>
                                <Dropdown onSelect={this.gearSelect}>
                                    <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item eventKey="mute_post"><p style={{ color: "red" }}>Mute Post</p></Dropdown.Item>
                                        <Dropdown.Item eventKey="mute_user"><p style={{ color: "red" }}>Mute User</p></Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </div>
                        </div>
                        <div className="single-video-author box mb-3">
                            <div className="float-right">
                                <Row>
                                    <Follow reflink={this.state.reflink} />
                                    <a target="_blank" style={{marginRight: "5px", marginLeft: "5px"}} className="btn btn-light btn-sm" onClick={this.PinLocally}>
                                        <FaDownload /> Download to IPFS node
                                    </a>
                                    <a target="_blank" style={{marginRight: "5px"}} className="btn btn-light btn-sm" href={this.state.videoLink}>
                                        <FaDownload /> Download
                                    </a>
                                </Row>
                            </div>
                            <img className="img-fluid" src={this.state.profilePictureURL} alt="" />
                            <p>
                                <a href={`#/user/${ref.source.value}:${ref.root}`}>
                                    <strong>
                                        {this.state.post_info.author}
                                    </strong>
                                </a>
                            </p>
                            <small>Published on {(() => {
                                const pattern = DateTime.compile('MMMM D, YYYY');
                                return DateTime.format(new Date(this.state.video_info.creation), pattern)
                            })()}
                            </small>
                        </div>
                        <div className="single-video-info-content box mb-3">
                            <h6>About :</h6>
                            <CollapsibleText>
                                <ReactMarkdown escapeHtml={false} source={DOMPurify.sanitize(this.state.video_info.description)}></ReactMarkdown>
                                <hr/>
                                <Container style={{marginBottom: "10px", textAlign:"center"}}>
                                    <a target="_blank" style={{marginRight: "5px"}} className="btn btn-light btn-sm" onClick={() => this.showDebug()}>
                                        <BsInfoSquare/> Debug Info
                                    </a>
                                </Container>
                            </CollapsibleText>
                            <h6>Tags: </h6>
                            <p className="tags mb-0">
                                {(() => {
                                    var out = [];
                                    if (this.state.video_info.tags) {
                                        for (const tag of this.state.video_info.tags) {
                                            out.push(<span style={{paddingLeft: "3px"}} key={tag}>
                                                <a>
                                                    {tag}
                                                </a>
                                            </span>);
                                        }
                                    }
                                    return out;
                                })()}
                            </p>
                        </div>
                        <CommentSection reflink={this.state.reflink.toString()} />
                    </Col>
                    <Col md={4}>
                        <Row>
                            <Col md={12}>
                                {
                                    this.state.recommendedVideos.map(value => (
                                        <VideoTeaser key={value.reflink} reflink={value.reflink}/>
                                    ))
                                }
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container> : <LoopCircleLoading/>}
        </div>;
    }
}

export default watch;