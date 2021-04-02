import React, { Component } from 'react';
import GridFeed from "./GridFeed";
import Follow from "../components/widgets/Follow";
import { Navbar, Nav, Card, Col, Row, Button } from "react-bootstrap";
import RefLink from "../../main/RefLink";
import {
    Switch,
    Route
} from 'react-router-dom';
import '../css/User.css'
import ReactMarkdown from "react-markdown";
const Utils = require('../utils').default;

/**
 * User about page with all the public information a casual and power user would need to see about another user.
 */
class User extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reflink: RefLink.parse(this.props.match.params.reflink),
            profileAbout: '',
            hiveBalance: 'HIVE',
            hbdBalance: 'HBD',
            coverURL: null
        }
    }
    async componentDidMount() {
        let accountBalances = Utils.accounts.getAccountBalances(this.state.reflink)
        let adsAccountStatus = await this.checkAccountStatus()
        this.setState({
            profileURL: await Utils.accounts.getProfilePictureURL(this.state.reflink),
            profileAbout: await Utils.accounts.getProfileAbout(this.state.reflink),
            hiveBalance: (await accountBalances).hive,
            hbdBalance: (await accountBalances).hbd,
            username: this.state.reflink.root,
            coverURL: await Utils.accounts.getProfileBackgroundImage(this.state.reflink),
        })
        console.log(this.state.coverURL)
    }
    /*get coverURL() {
        switch (this.state.reflink.source.value) {
            case "hive": {
                return `https://threespeakvideo.b-cdn.net/user/${this.state.reflink.root}/cover.png`
            }
        }
    }*/
    render() {
        return (<div>
            <div className="single-channel-image">
                <img className="img-fluid mh-20" style={{ objectFit: 'cover', objectPosition: 'center', maxHeight: '500px' }} alt="" src={this.state.coverURL} />
                <div className="channel-profile" style={{position: this.state.profileURL ? "absolute" : "unset"}}>
                    <img className="channel-profile-img" alt="" src={this.state.profileURL} />
                </div>
            </div>
            <div className="single-channel-nav">
                <Navbar expand="lg" bg="light">
                    <a className="channel-brand">{this.state.reflink.root}</a>
                    <Navbar.Toggle aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </Navbar.Toggle>
                    <Navbar.Collapse id="navbarSupportedContent">
                        <Nav className="mr-auto">
                            <Nav.Link href={`#/user/${this.state.reflink.toString()}/`}>Videos <span className="sr-only">(current)</span></Nav.Link>
                            <Nav.Link href={`#/user/${this.state.reflink.toString()}/earning`}>Earnings</Nav.Link>
                            <Nav.Link href={`#/user/${this.state.reflink.toString()}/about`}>About</Nav.Link>
                        </Nav>
                        <div className="form-inline my-2 my-lg-0">
                            <Follow reflink={this.state.reflink.toString()} />
                        </div>
                    </Navbar.Collapse>
                </Navbar>
            </div>
            <Switch>
                <Route exact path={`/user/${this.state.reflink.toString()}`}>
                    <section className="content_home" style={{ height: 'auto !important' }}>
                        <GridFeed type={'@' + this.state.reflink.root} awaitingMoreData={true} />
                    </section>
                </Route>
                <Route path={`/user/${this.state.reflink.toString()}/earning`}>
                    <Row>
                        <Col md={6}>
                            <Card className="bg-steem status">
                                <Card.Header>
                                    <Card.Title className="text-center">{this.state.hiveBalance}</Card.Title>
                                </Card.Header>
                                <Card.Body className="bg-white text-center">
                                    <strong>Available HIVE Balance</strong>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={6}>
                            <Card className="bg-sbd status">
                                <Card.Header>
                                    <Card.Title className="text-center">{this.state.hbdBalance}</Card.Title>
                                </Card.Header>
                                <Card.Body className="bg-white text-center">
                                    <strong>Available HBD Balance</strong>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Route>
                <Route path={`/user/${this.state.reflink.toString()}/about`}>
                    <ReactMarkdown className={'p-3'} source={this.state.profileAbout}/>
                </Route>
                <Route path={`/user/${this.state.reflink.toString()}/native-ads`}>
                    <div className={'ads-manager-area'}>
                        <Row>
                            <Col md={6}>
                                <Card className="bg-steem status">
                                    <Card.Header>
                                        <Card.Title className="text-center">
                                        <h4 className="text-center">Advertizer</h4></Card.Title>
                                    </Card.Header>
                                    <Card.Body className="bg-white text-center">
                                        <div id="no-advertizer">
                                            <Row>
                                                <Col md={12}>
                                                    <p>Create advertizer account</p>
                                                </Col>
                                                <Col md={12} style={{width: "100%"}}><input type="text" id="create-advertizer-user" value={this.state.username} style={{marginTop: "3%", width: "100%", paddingLeft: "3%"}} disabled /></Col>
                                                <Col md={12} style={{width: "100%"}}><input type="text" id="create-advertizer-text" placeholder="Please Enter Your Active Key" style={{marginTop: "3%", width: "100%", paddingLeft: "3%"}} /></Col>
                                            </Row>
                                            <br />
                                            <Button className="btn btn-light" style={{marginTop: "3%", verticalAlign: "baseline"}} onClick={this.createAdvertizer}>
                                                CREATE
                                            </Button>
                                        </div>

                                        <div id="advertizer-area">Adsa</div>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="bg-sbd status">
                                    <Card.Header>
                                        <Card.Title className="text-center"><h4 className="text-center">Monetizer</h4></Card.Title>
                                    </Card.Header>
                                    <Card.Body className="bg-white text-center">
                                        <div id="no-monetizer">
                                            <Row>
                                                <Col md={12}>
                                                    <p>Create monetizer account</p>
                                                </Col>
                                                <Col md={12} style={{width: "100%"}}><input type="text" id="create-monetizer-user" value={this.state.username} style={{marginTop: "3%", width: "100%", paddingLeft: "3%"}} disabled /></Col>
                                                <Col md={12}><input type="text" id="create-monetizer-text" placeholder="Please Enter Your Active Key" style={{marginTop: "3%", width: "100%", paddingLeft: "3%"}} /></Col>
                                            </Row>
                                            <br />
                                            <Button className="btn btn-light" style={{marginTop: "3%", verticalAlign: "baseline"}} onClick={this.createMonetizer}>
                                                CREATE
                                            </Button>
                                        </div>

                                        <div id="monetizer-area">
                                            <Row id="monetizer-ops-list">
                                                <Col md={12} style={{marginBottom: "7%"}}>
                                                    <Card className="bg-steem status">
                                                        <Card.Header>
                                                            <Card.Title id="create-ad-space-text">
                                                                <h6 className="text-center">Create Ad Space</h6>
                                                            </Card.Title>
                                                        </Card.Header>
                                                        <Card.Body className="bg-white text-center" id="create-ad-space-btn">
                                                            <Button className="btn btn-light" style={{marginTop: "3%", verticalAlign: "baseline"}} onClick={this.revealAdSpace}>
                                                                CREATE
                                                            </Button> 
                                                        </Card.Body>
                                                    </Card>      
                                                </Col>
                                                <Col md={12}>
                                                    <div id="display-ad-spaces">
                                                        <Card className="bg-steem status">
                                                            <Card.Header>
                                                                <Card.Title className="text-center">
                                                                <h6 className="text-center">Available Ad Spaces</h6></Card.Title>
                                                            </Card.Header>
                                                            <Card.Body className="bg-white text-center">
                                                                <ul id="ad-spaces-list"></ul>
                                                            </Card.Body>
                                                        </Card>
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Row id="create-ad-space-area">
                                                <Col md={12}>
                                                    <input type="text" id="create-ad-space-username" value={this.state.username} style={{marginTop: "3%", width: "100%", paddingLeft: "3%"}} disabled/>
                                                </Col>
                                                <Col md={12}>
                                                    <input type="text" id="space-name" placeholder="Please Enter Your New Space Name" style={{marginTop: "3%", width: "100%", paddingLeft: "3%"}} />
                                                </Col>
                                                <Col md={12}>
                                                    <input type="text" id="space-title" placeholder="Please Enter Your Desired Space Title" style={{marginTop: "3%", width: "100%", paddingLeft: "3%"}} />
                                                </Col> 
                                                <Col md={12}>
                                                    <textarea type="text" id="space-characteristics" placeholder="Describe The Characteristics Of This Ad Space" style={{marginTop: "3%", width: "100%", paddingLeft: "3%"}}></textarea>
                                                </Col> 
                                                <Col md={12}>
                                                    <textarea id="space-guidelines" placeholder="What are the guidelines to be followed by advertizers in order to get this ad space" style={{marginTop: "3%", width: "100%", paddingLeft: "3%"}}></textarea>
                                                </Col>
                                                <Col md={12}>
                                                    <input type="text" id="the-k" placeholder="Please Enter Your Active Key" style={{marginTop: "3%", width: "100%", paddingLeft: "3%"}} />
                                                </Col>
                                                <Col md={12} id="ad-space-success">
                                                    <p className="text-center">Ad space created successfully</p>
                                                </Col>
                                                <Col md={6}>
                                                    <Button className="btn btn-light" style={{marginTop: "3%", verticalAlign: "baseline"}} onClick={this.closeAdSpace}>
                                                        CLOSE
                                                    </Button>
                                                </Col>
                                                <Col md={6}>
                                                    <Button className="btn btn-light" style={{marginTop: "3%", verticalAlign: "baseline"}} onClick={this.createAdSpace}>
                                                        CREATE
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </Route>
                <Route path={`/user/${this.state.reflink.toString()}/playlists`}>
                    <Row>
                    <Col md={12} className="playlist-enclose">
                            <Card className="status create-playlist-btn-area">
                                <Card.Body className="bg-white text-center">
                                    <Button className="btn btn-light" style={{marginTop: "3%", verticalAlign: "baseline", position: "relative", float: "right"}} onClick={this.newPlaylistInit}>
                                        NEW PLAYLIST
                                    </Button>
                                </Card.Body>
                            </Card>

                            <Card className="status view-playlists">
                                <Card.Body className="bg-white text-center">
                                    View list of playlists
                                </Card.Body>
                            </Card>

                            <Card className="status new-playlist-form-area">
                                <Card.Body className="bg-white text-center">
                                    Create a new playlist

                                    <Button className="btn btn-light" style={{marginTop: "3%", verticalAlign: "baseline", position: "relative", float: "right"}}>
                                        CREATE
                                    </Button>
                                    <Button className="btn btn-light" style={{marginTop: "3%", verticalAlign: "baseline", position: "relative", float: "right"}}>
                                        CANCEL
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Route>
            </Switch>
        </div>);
    }
}
export default User;