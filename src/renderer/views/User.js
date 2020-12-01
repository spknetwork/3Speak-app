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
            hbdBalance: 'HBD'
        }
    }
    async componentDidMount() {
        let accountBalances = Utils.accounts.getAccountBalances(this.state.reflink)
        this.setState({
            profileURL: await Utils.accounts.getProfilePictureURL(this.state.reflink),
            profileAbout: await Utils.accounts.getProfileAbout(this.state.reflink),
            hiveBalance: (await accountBalances).hive,
            hbdBalance: (await accountBalances).hbd,
            username: this.state.reflink.root
        })
    }
    get coverURL() {
        switch (this.state.reflink.source.value) {
            case "hive": {
                return `https://img.3speakcontent.co/user/${this.state.reflink.root}/cover.png`
            }
        }
    }
    render() {
        return (<div>
            <div className="single-channel-image">
                <img className="img-fluid mh-20" style={{ objectFit: 'cover', objectPosition: 'center', maxHeight: '500px' }} alt="" src={this.coverURL} />
                <div className="channel-profile">
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
            </Switch>
        </div>);
    }
}
export default User;