import React, { Component } from 'react';
import { FaChevronCircleRight } from 'react-icons/fa';
import utils from '../../utils';
import RefLink from '../../../main/RefLink'
import {Col} from 'react-bootstrap'

class CommunityTile extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reflink: RefLink.parse(props.reflink),
            communityPicture: ""
        }
    }
    async componentDidMount() {
        this.setState({
            communityPicture: await utils.accounts.getProfilePictureURL(this.props.reflink)
        })
    }
    render() { 
        return (<Col className="col-md-3 col-sm-3 mb-3" md={3} sm={3} mb={3}>
        <a href={`#/community/${this.props.reflink}`} className="font-weight-bold">
            <div className="community-card channels-card">
                <div className="text-left" style={{display: "inline-block", float: "left"}}>
                    <img style={{width: "40px", height: "40px", borderRadius: "50%", verticalAlign: "middle"}} src={this.state.communityPicture + "?size=icon"}/>
                    {this.props.info.title}
                </div>
                <div className="text-right" style={{display: "inline-block", paddingTop: "2px", float: "right"}}>
                    <div></div>
                    <span className="text-success"></span>
                    <FaChevronCircleRight/>
                </div>
                <div style={{clear: "both"}}></div>
            </div>
        </a>
    </Col>);
    }
}
 
export default CommunityTile;