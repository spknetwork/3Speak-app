import React, { Component } from 'react';
import utils from '../../utils';
import RefLink from '../../../main/RefLink'

class LeaderTile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reflink: RefLink.parse(props.reflink),
            info: props.info,
            profilePicture: null,
            borderLeftCode: null
        }
    }
    async componentDidMount() {
        let borderLeftCode;
        switch(this.state.info.rank) {
            case 1: {
                borderLeftCode = "#d4af37 solid 6px"
                break;
            }
            case 2: {
                borderLeftCode = "#bec2cb solid 6px"
                break;
            }
            case 3: {
                borderLeftCode = "#b08d57 solid 6px"
                break;
            }
            default: {
                
            }
        }
        this.setState({
            profilePicture: await utils.accounts.getProfilePictureURL(this.props.reflink),
            borderLeftCode
        })
    }
    render() {
        return (<div className="channels-card" style={{ borderLeft: this.state.borderLeftCode }}>
            <div className="channels-card-image">
                <a href={`#/user/${this.props.reflink.toString()}`}><img className="img-fluid" src={this.state.profilePicture} alt="" /></a>
                <div className="channels-card-image-btn">
                    <a href={`#/user/${this.state.reflink.toString()}`} className="btn btn-outline-primary btn-sm">View Channel
                </a>
                </div>
            </div>
            <div className="channels-card-body">
                <div className="channels-title">
                    <a href={`#/user/${this.state.reflink.toString()}`}>{this.state.reflink.root}</a>
                </div>
                <div>
                    <i></i>
                </div>
            </div>
            <div className="channels-card-rank badge badge-dark text-white">Rank: {this.state.info.rank}</div>
            <div className="channels-card-score badge badge-dark text-white">Score: {Math.round(this.state.info.score)}</div>
        </div>);
    }
}

export default LeaderTile;