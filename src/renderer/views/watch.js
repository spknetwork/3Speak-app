import React from 'react';
import Player from '../components/Player'
import {Col, Row, Container} from 'react-bootstrap'
import utils from '../utils';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
const queryString = require('query-string')

class watch extends React.Component {
    constructor(props) {
        super(props);
        this.state = { player:null, video_info: {} };
    }
    async componentDidMount() {
        this.mountPlayer();
    }
    generateRelated() {

    }
    async mountPlayer() {
        const permalink = queryString.parse(location.search).v
        var playerType = "standard";
        switch(playerType) {
            case "standard": {
                this.setState({
                    player: <Player></Player>, //Insert player here
                    video_info: await utils.permalinkToVideoInfo(permalink)
                })
            }
        }
    }
    render() {
        return <div>
            <Container fluid pb={0}>
                <Row fluid="md">
                    <Col md={7} className="box">
                        <div>
                            {this.state.player}
                        </div>
                        <div className="float-left">
                            <h2 style={{fontSize:"18px"}}>
                                <a>{this.state.video_info.title}</a>
                            </h2>
                        </div>
                        <div className="float-right" style={{textAlign: "right !important", float: "right !important", display: "inline-block !important"}}>
                            <span>
                                <span style={{padding:"0 !important"}}>
                                    <FaThumbsUp/>
                                    1
                                </span>
                                <span style={{padding:"0 !important"}}>
                                    <FaThumbsDown/>
                                </span>
                            </span>
                        </div>
                    </Col>
                    <Col md={4}>
                        <Row>
                            {}
                        </Row>
                    </Col>

                </Row>

            </Container>
        </div>;
    }
}

export default watch;