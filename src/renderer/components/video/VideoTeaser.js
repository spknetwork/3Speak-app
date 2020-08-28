import React, { Component } from 'react';
import { FaCalendarAlt, FaEye } from 'react-icons/fa';
import utils from '../../utils';
import Reflink from '../../../main/RefLink';
import convert from 'convert-units';
import DateTime from 'date-and-time';

class VideoTeaser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            video_info: {sources: {}, meta: {}},
            thumbnail: null,
            reflink: Reflink.parse(this.props.reflink)
        };
    }
    async componentDidMount() {
        this.setState({
            video_info: await utils.accounts.permalinkToVideoInfo(this.props.reflink),
            thumbnail: await utils.video.getThumbnailURL(this.props.reflink)
        });
    }
    render() {
        return (<div className="video-card-list">
            <div className="teaser_holder video-card-image">
                <div className="card-label">
                    {(() => {
                        const pattern = DateTime.compile('mm:ss');
                        return DateTime.format(new Date(this.state.video_info.meta.duration * 1000), pattern)
                    })()}
                </div>
                <a href={`#/watch/${this.props.reflink}`}>
                    <img className="img-fluid bg-dark" src={this.state.thumbnail} alt="" />
                </a>
            </div>
            <span className="video-card-body">
                <div className="video-title">
                    <a href={`#/watch/${this.props.reflink}`} style={{textOverflow: "ellipsis", overflow: "nowrap"}}>
                        {this.state.video_info.title}
                    </a>
                </div>
                <div className="video-page">
                    <a href={`#/user/${this.state.reflink.source.value}:${this.state.reflink.root}`}>{this.state.reflink.root}</a>
                </div>
                <div className="video-view">
                    <FaEye/> Unknown views
                    <span>
                        <FaCalendarAlt/> 
                        {(() => {
                            if(this.state.video_info.creation) {
                                const dateBest = convert((new Date(new Date().toUTCString()) /1)  - (Date.parse(this.state.video_info.creation) / 1)).from("ms").toBest();
                                if(Math.round(dateBest.val) >= 2) {
                                    return `${Math.round(dateBest.val)} ${dateBest.plural} ago`;
                                } else {
                                    return `${Math.round(dateBest.val)} ${dateBest.singular} ago`;
                                }
                            }
                        })()}
                    </span>
                </div>
            </span>
        </div>);
    }
}

export default VideoTeaser;