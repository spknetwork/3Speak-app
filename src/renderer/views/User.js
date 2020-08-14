import React, { Component } from 'react';
import { FaBell } from 'react-icons/fa'
import VideoWidget from "../components/video/VideoWidget";
import Image from "react-bootstrap";
import GridFeed from "./GridFeed";
import Follow from "../components/widgets/Follow";
const Reflink = require('../../main/RefLink');
const Utils = require('../utils').default;

/**
 * User about page with all the public information a casual and power user would need to see about another user.
 */
class User extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reflink: this.props.match.params.reflink
        }
    }
    componentDidMount() {
        Utils.accounts.getProfilePictureURL(this.state.reflink).then(url => {
            this.setState({
                profileURL: url
            })
        })
    }
    render() {
        return (<div>
            <div className="single-channel-image">
                <img className="img-fluid mh-20" style={{objectFit: 'cover', objectPosition: 'center', maxHeight: '500px'}} alt="" src="https://img.3speakcontent.online/user/nicksmitley/cover.png" />
                <div className="channel-profile">
                    <img className="channel-profile-img" alt="" src={this.state.profileURL}/>
                </div>
            </div>
            <div className="single-channel-nav">
                <nav className="navbar navbar-expand-lg navbar-light">
                    <a className="channel-brand">{this.state.reflink.root}</a>
                    <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item active">
                                <a className="nav-link" href={`#/user/${this.state.reflink}/`}>Videos <span className="sr-only">(current)</span></a>
                            </li>
                            <li className="nav-item ">
                                <a className="nav-link" href={`#/user/${this.state.reflink}/earning`}>Earnings</a>
                            </li>
                            <li className="nav-item ">
                                <a className="nav-link" href={`#/user/${this.state.reflink}/about`}>About</a>
                            </li>
                            <li className="nav-item ">
                                <a className="nav-link" href={`#/user/${this.state.reflink}/live`}>Livestream</a>
                            </li>
                        </ul>
                        <div className="form-inline my-2 my-lg-0">
                            <Follow user={this.state.reflink} />
                        </div>
                    </div>
                </nav>
            </div>
            <section className="content_home" style={{height: 'auto !important'}}>
                <GridFeed getUser={this.state.reflink} awaitingMoreData={true} />
            </section>
        </div>);
    }
}
export default User;