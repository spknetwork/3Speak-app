import React, { Component } from 'react';
import utils from '../utils'
import Reflink from '../../main/RefLink'
import DateTime from 'date-and-time';
import PlaySVG from '../assets/img/play.svg'
import { FaUser } from 'react-icons/fa'

class VideoWidget extends Component {
    constructor(props) {
        super(props);
        this.state = {
            video_info: {},
            permalink: {}
        }
    }
    async componentDidMount() {
        this.setState({
            video_info: await utils.accounts.permalinkToVideoInfo(this.props.permalink),
            reflink: Reflink.parse(this.props.permalink)
        })
    }
    render() {
        return (<div className="col-lg-2 col-6 marg_bot1" style={{padding: "1 !important"}}>
            <div className="teaser_holder text-center">
                <div className="card-label card-label-views">
                    <img className="play_i" src={PlaySVG} height="11px" />
                    <span></span>
                </div>
                <div className="card-label">
                    {(() => {
                        const pattern = DateTime.compile('mm:ss');
                        return DateTime.format(new Date(this.state.video_info.duration* 1000), pattern)
                    })()}
                </div>
                <a href={`#/watch?v=${this.props.permalink}`}>
                    <img style={{width: "100% !important", padding: "5px"}} data-permlink={this.state.reflink.permlink} className="img-fluid bg-dark" src="https://img.3speakcontent.online/jnndmbit/thumbnail.png" />
                </a>
            </div>
            <a href={`#/watch?v=${this.props.permalink}`}>
                <b data-toggle="tooltip" data-placement="bottom" title="" className="max-lines word-break" data-original-title="Decentralized Blockchains - Let's Talk About It">{this.state.video_info.title}</b>
            </a>
            <div className="mt-2">
                <span className="black_col">
                    <b><a href={`/user/${this.state.reflink.author}`}> <FaUser/> {this.state.reflink.author}</a></b>
                </span>
                <br/>
                <span>{(() => {
                        const dateBest = convert((new Date() / 1) - (new Date(this.state.video_info.creation) / 1)).from("ms").toBest()
                        if(Math.round(dateBest.val) >= 2) {
                            return `${Math.round(dateBest.val)} ${dateBest.plural} ago`
                        } else {
                            return `${Math.round(dateBest.val)} ${dateBest.singular} ago`
                        }
                    })()}</span>
            </div>
        </div>);
    }
}

export default VideoWidget;