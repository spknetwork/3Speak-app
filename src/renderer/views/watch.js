import React, {useState, useEffect} from 'react';
import Player from '../components/video/Player';
import { Col, Row, Container, Dropdown, Tabs, Tab } from 'react-bootstrap';
import utils from '../utils';
import { FaThumbsUp, FaThumbsDown, FaCogs, FaDownload, FaSitemap } from 'react-icons/fa';
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
import Vote from "../components/video/Vote";
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
import ArraySearch from 'arraysearch';
import Knex from 'knex'
import IPFSHTTPClient from 'ipfs-http-client'
import Consts from '../../consts'
const debug = Debug("3speak:watch")
const Finder = ArraySearch.Finder;
const knex = Knex({
    client: 'mssql',
    connection: {
        host: 'vip.hivesql.io',
        user: Consts.hivesql_username,
        password: Consts.hivesql_password,
        database: 'DBHive'
    },
    pool: {
        max: 7,
        min: 3
    }
});

const ipfsClient = new IPFSHTTPClient('/ip4/127.0.0.1/tcp/5001')
function DHTProviders(props) {
    const [peers, setPeers] = useState(0)
    useEffect(() => {
        (async () => {
            if(!props.rootCid) {
                return;
            }
            console.log(ipfsClient)
            console.log(props.rootCid)
            let out = 0;
            for await(const pov of ipfsClient.dht.findProvs(props.rootCid)) {
                console.log(pov)
                out = out + 1;
                setPeers(out)
            }
            setPeers(out)
        })();
        return () => {

        }
    }, [])
    return <div>
        <FaSitemap/> DHT Providers <strong>{peers}</strong>
    </div>
}

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
            loaded: false,
            loadingMessage: "loading",
            rootCid: null
        };
        this.player = React.createRef()
        this.gearSelect = this.gearSelect.bind(this);
        this.PinLocally = this.PinLocally.bind(this);
    }
    async componentDidMount() {
        console.log(this.state)
        try {
            await this.generalFetch() 
            this.setState({loadingMessage: "Loading: Mounting player..."})
            await this.mountPlayer();
        } catch (ex) {
            this.setState({loadingMessage: "Loading resulted in error"})
            throw ex;
        }
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
            video_info: await utils.accounts.permalinkToVideoInfo(this.state.reflink, {type:"video"}),
            post_info: await utils.accounts.permalinkToPostInfo(this.state.reflink)
        })
        try {
            //Leave profileURL default if error is thrown when attempting to retrieve profile picture
            this.setState({ profilePictureURL: await utils.accounts.getProfilePictureURL(this.state.reflink) })
        } catch (ex) {
            console.log(ex)
            throw ex;
        }
        document.title = `3Speak - ${this.state.video_info.title}`
        let cids = [];
        for(const source of this.state.video_info.sources) {
            const url = new (require('url').URL)(source.url)
            try {
                new CID(url.host)
                cids.push(url.host)
            } catch {

            }
        }
        this.setState({
            rootCid: cids[0]
        })
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
        return;
        /*let cids = [];
        for(const source of this.state.video_info.sources) {
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
                _id: this.state.reflink,
                source: "Watch Page",
                cids,
                expire: (new Date() / 1) + convert("1").from("d").to("ms"),
                meta: {
                    title: this.state.video_info.title
                }
            })
        }*/
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
        var query = knex.raw(`SELECT TOP 25 x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND category LIKE '${this.state.post_info.category}' ORDER BY NEWID()`)
        var blob = [];
        query.stream().on('data', async (val) => {
            if (await PromiseIpc.send("blocklist.has", `hive:${val.author}:${val.permlink}`)) {
                console.log(`${val.author} is blocked`)
                return;
            }
            val.json_metadata = JSON.parse(val.json_metadata)
            //console.log(val)
            if(!val.json_metadata.video) {
                val.json_metadata.video = {
                    info: {}
                }
            }
            let thumbnail;
            if(val.json_metadata.sourceMap) {
                thumbnail = Finder.one.in(val.json_metadata.sourceMap).with({type:"thumbnail"}).url
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
                "isIpfs": val.json_metadata.video.info.ipfs || thumbnail ? true : false,
                "ipfs": val.json_metadata.video.info.ipfs,
                "images": {
                    "ipfs_thumbnail":  thumbnail ?  `/ipfs/${thumbnail.slice(7)}` : `/ipfs/${val.json_metadata.video.info.ipfsThumbnail}` ,
                    "thumbnail": `https://threespeakvideo.b-cdn.net/${val.permlink}/thumbnails/default.png`,
                    "poster": `https://threespeakvideo.b-cdn.net/${val.permlink}/poster.png`,
                    "post": `https://threespeakvideo.b-cdn.net/${val.permlink}/post.png`
                },
                views: val.total_vote_weight ? Math.log(val.total_vote_weight / 1000).toFixed(2) : 0
            })
            this.setState({
                recommendedVideos: blob
            })
        })
        query.on('query-response', (ret, det, aet) => {
            console.log(ret, det, aet)
        })
        query.on("end", (err) => {
            console.log(err)
        })
        /*
        var ref = RefLink.parse(this.state.reflink)
        var data = (await axios.get(`https://3speak.tv/apiv2/recommended?v=${ref.root}/${ref.permlink}`)).data
        data.forEach((value => {
            var link = value.link.split("=")[1].split("/")
            value.reflink = `hive:${link[0]}:${link[1]}`
        }))*/
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
                expire: null,
                meta: {
                    title: this.state.video_info.title
                }
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
                                <DHTProviders rootCid={this.state.rootCid}/>
                            </div>
                            <div className="float-right" style={{ textAlign: "right !important", float: "right !important", display: "inline-block !important" }}>
                                <span>
                                    <Vote reflink={this.state.reflink} />
                                </span>
                                <Dropdown onSelect={this.gearSelect} style={{paddingTop: "10px"}}>
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
                                    <a target="_blank" style={{marginRight: "5px"}} className="btn btn-light btn-sm" href={(() => {
                                        var videoSource = Finder.one.in(this.state.video_info.sources).with({
                                            format: "mp4"
                                        })
                                        if(videoSource) {
                                            return videoSource.url
                                        }
                                    })()}>
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
            </Container> : <div>
             <LoopCircleLoading/> 
             <center style={{margin: "auto", position: "absolute", left: "0px", right: "0px", top: "60%", bottom: "0px"}}>
                <h1 style={{top: "60%", fontSize:"20px"}}>{this.state.loadingMessage}</h1>
             </center>
             </div>}
        </div>;
    }
}

export default watch;