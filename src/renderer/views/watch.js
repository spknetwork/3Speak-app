import React from 'react';
import Player from '../components/video/Player';
import { Col, Row, Container } from 'react-bootstrap';
import utils from '../utils';
import { FaThumbsUp, FaThumbsDown, FaCogs, FaDownload, FaBell } from 'react-icons/fa';
import DateTime from 'date-and-time';
import ReactMarkdown from 'react-markdown';
import CollapsibleText from '../components/CollapsibleText';
import EmptyProfile from '../assets/img/EmptyProfile.png';
import VideoTeaser from '../components/video/VideoTeaser';
import CommentSection from '../components/video/CommentSection';
import Follow from "../components/widgets/Follow";
import RefLink from '../../main/RefLink'

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
            videoLink: ""
        };
    }
    componentDidMount() {
        this.mountPlayer();
    }
    generateRelated() {

    }
    async mountPlayer() {
        var playerType = "standard";
        switch (playerType) {
            case "standard": {
                this.setState({
                    player: <Player reflink={this.props.match.params.reflink}></Player>, //Insert player here
                    video_info: await utils.accounts.permalinkToVideoInfo(this.state.reflink),
                    post_info: await utils.accounts.permalinkToPostInfo(this.state.reflink),
                    videoLink: await utils.video.getVideoSourceURL(this.state.reflink)
                })
            }
        }
        try {
            //Leave profileURL default if error is thrown when attempting to retrieve profile picture
            this.setState({ profilePictureURL: await utils.accounts.getProfilePictureURL(this.state.reflink) })
        } catch {

        }
    }
    render() {
        console.log(this.props);
        console.log(this.state.post_info)
        console.log(this.state.video_info)
        var ref = RefLink.parse(this.state.reflink)
        return <div>
            <Container fluid pb={0}>
                <Row fluid="md">
                    <Col md={6}>
                        <div>
                            {this.state.player}
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
                                <br />
                                <button style={{ float: "right" }} className="btn btn-sm dropdown-toggle btn-secondary" id="videoOptions" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" className="btn btn-secondary btn-sm dropdown-toggle">
                                    <FaCogs />
                                </button>
                            </div>

                        </div>
                        <div className="single-video-author box mb-3">
                            <div className="float-right">
                                <Follow reflink={this.state.reflink} />

                                <a target="_blank" className="btn btn-light btn-sm" href={this.state.videoLink}>
                                    <FaDownload /> Download
                                </a>
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
                                <ReactMarkdown source={this.state.video_info.description}></ReactMarkdown>
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
                        <CommentSection reflink={this.state.reflink.toString()}/>
                    </Col>
                    <Col md={5}>
                        <Row>
                            <Col md={12}>
                                <VideoTeaser reflink={this.state.reflink}>

                                </VideoTeaser>
                            </Col>
                        </Row>
                    </Col>

                </Row>

            </Container>
        </div>;
    }
}

export default watch;