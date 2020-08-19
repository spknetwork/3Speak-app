import React, { Component } from 'react';
import utils from '../../utils';
import Reflink from '../../../main/RefLink';
import DateTime from 'date-and-time';
import PlaySVG from '../../assets/img/play.svg'
import { FaUser } from 'react-icons/fa'
import convert from "convert-units";
import {Link, HashRouter} from 'react-router-dom';
import nsfwWarning from '../../assets/img/nsfw.png'

class VideoWidget extends Component {
    constructor(props) {
        super(props);
        this.state = {
            video_info: props,
            permlink: props.permlink,
            reflink: {permlink: '', author: ''}
        }
    }
    async componentDidMount() {
        this.setState({
            //video_info: await utils.accounts.permalinkToVideoInfo(this.props.reflink),
            reflink: Reflink.parse(this.props.reflink)
        })
    }
    render() {
        return (<HashRouter><div className="col-lg-2 col-6 marg_bot1 videowidget-padding">
            <div className="teaser_holder text-center">
                <div className="card-label card-label-views">
                    <img className="play_i" src={PlaySVG} height="11px" />
                    <span>{this.props.views}</span>
                </div>
                <div className="card-label">
                    {(() => {
                        const pattern = DateTime.compile('mm:ss');
                        return DateTime.format(new Date(this.state.video_info.duration* 1000), pattern)
                    })()}
                </div>
                <a href={`#/watch/${this.props.reflink}`}>
                    <img style={{width: "100% !important", padding: "5px"}} data-permlink={this.state.reflink.permlink} className="img-fluid bg-dark" src={(() => {
                        if(this.props.isNSFW) {
                            return nsfwWarning;
                        } else {
                            return "https://img.3speakcontent.online/"+this.props.permlink+"/thumbnail.png"
                        }
                    })()} />
                </a>
            </div>
            <a href={`#/watch/${this.props.reflink}`}>
                <b data-toggle="tooltip" data-placement="bottom" title={this.state.video_info.title} className="max-lines word-break" data-original-title={this.state.video_info.title}>{this.state.video_info.title}</b>
            </a>
            <div className="mt-2">
                <span className="black_col">
                    <b><a href={`#/user/${this.props.reflink}`}> <FaUser/> {this.state.reflink.root}</a></b>
                </span>
                <br/>
                <span>{(() => {
                        const dateBest = convert((new Date() / 1) - (new Date(this.state.video_info.created) / 1)).from("ms").toBest()
                        if(Math.round(dateBest.val) >= 2) {
                            return `${Math.round(dateBest.val)} ${dateBest.plural} ago`
                        } else {
                            return `${Math.round(dateBest.val)} ${dateBest.singular} ago`
                        }
                    })()}</span>
            </div>
        </div></HashRouter>);
    }
}

export default VideoWidget;