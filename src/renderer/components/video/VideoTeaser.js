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
            video_info: {sources: {}},
            thumbnail: null,
            permalink: {}
        };
    }
    async componentDidMount() {
        this.setState({
            video_info: await utils.accounts.permalinkToVideoInfo(this.props.permalink),
            thumbnail: await utils.video.getThumbnailURL(this.props.permalink),
            permalink: Reflink.parse(this.props.permalink)
        });
    }
    render() {
        return (<div className="video-card-list">
            <div className="teaser_holder video-card-image">
                <div className="card-label">
                    {(() => {
                        const pattern = DateTime.compile('mm:ss');
                        return DateTime.format(new Date(this.state.video_info.duration * 1000), pattern)
                    })()}
                </div>
                <a href={`#/watch?v=${this.props.permalink}`}>
                    <img className="img-fluid bg-dark" src={this.state.thumbnail} alt="" />
                </a>
            </div>
            <span className="video-card-body">
                <div className="video-title">
                    <a href={`#/watch?v=${this.props.permalink}`}>{this.state.video_info.title}</a>
                </div>
                <div className="video-page">
                    <a href={`#/user/${this.state.permalink.root}`}>{this.state.permalink.root}</a>
                </div>
                <div className="video-view">
                    <FaEye/> Unknown views
                    <span>
                        <FaCalendarAlt/> 
                        {(() => {
                            const dateBest = convert((new Date() / 1) - (new Date(this.state.video_info.creation) / 1)).from("ms").toBest();
                            if(Math.round(dateBest.val) >= 2) {
                                return `${Math.round(dateBest.val)} ${dateBest.plural} ago`;
                            } else {
                                return `${Math.round(dateBest.val)} ${dateBest.singular} ago`;
                            }
                        })()}
                    </span>
                </div>
            </span>
        </div>);
    }
}

export default VideoTeaser;