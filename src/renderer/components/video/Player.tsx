import React from 'react';
import ReactJWPlayer from 'react-jw-player';
import mergeOptions from 'merge-options'
import PromiseIpc from 'electron-promise-ipc'
import utils from '../../utils';
import CID from 'cids';
import convert from 'convert-units'

class Player extends React.Component<any,any> {
    player: any;
    constructor(props) {
        super(props);
        
        this.state = {
            playerId: Math.random().toString(),
            videoUrl: null,
            videoInfo: null
        }
        this.player = React.createRef();
        this.onPlay = this.onPlay.bind(this)
    }
    async componentDidMount() {
        this.fireUp();
    }
    async fireUp() {
        // hive/vaultec81/myPostId
        let reflink;
        if(this.props.reflink) {
            reflink = this.props.reflink;
        } else {
            reflink = this.props.match.params.reflink;
        }
        //Player specific options unrelated to video metadata
        let defaultOptions = {
            ipfsGateway: "https://ipfs.io"
        }
        let options;
        if(this.props.options) {
            options = mergeOptions(defaultOptions, this.props.options);
        } else {
            options = defaultOptions;
        }

        let videoInfo;
        let videoUrl;
        if(this.props.videoInfo) {
            var exampleVideoInfo = {
                sources: {
                    video: {
                        format: "mp4", // or ["hls", "webm"]
                        url: ""
                    },
                    thumbnail: "", //Full URL can be IPFS URL or http
                }, 
                title: "My video title",
                description: "Video description", //Markdown supported
                duration: 15, //Duration as number in s.ms format
                creation: "2020-06-13T03:05:30.000Z", //Creation time in ISO time.
                tags: ["test_video", "first_video"],
                refs: ['SourceSystem/accountName/permlink'], //(Reflink) Reserved for future use when multi account system support is added.
                meta: {} //Anything non essential can be specfied here
            }
            videoInfo = this.props.videoInfo;
        } else {
            //Generate videoInfo from permalink
            if(reflink) {
                videoInfo = await utils.accounts.permalinkToVideoInfo(reflink)
            }
        }
        this.setState({
            videoInfo,
            thumbnail: await utils.video.getThumbnailURL(videoInfo),
            videoUrl: await utils.video.getVideoSourceURL(videoInfo)
        })
    }
    async onPlay(event) {
        let cids = [];
        console.log(this.state.videoInfo.sources)
        for(const source of this.state.videoInfo.sources) {
            const url = new (require('url').URL)(source.url)
            try {
                new CID(url.host)
                cids.push(url.host)
            } catch  {
            }
        }
        console.log(`CIDs to cache ${JSON.stringify(cids)}`)

        if(cids.length !== 0) {
            await PromiseIpc.send("pins.add", {
                _id: this.props.reflink,
                source: "Watch Page",
                cids,
                expire: (new Date().getTime()) + convert("10").from("d").to("ms"),
                meta: {
                    title: this.state.videoInfo.title
                }
            } as any)
        }
    }
    ExecUpdate() {
        this.fireUp()
        this.player.current.componentDidMount()
    }
    render() {
        return <React.Fragment>
            {this.state.videoUrl ? <ReactJWPlayer licenseKey="64HPbvSQorQcd52B8XFuhMtEoitbvY/EXJmMBfKcXZQU2Rnn" customProps={{playbackRateControls: true, autostart: false}}
            file={this.state.videoUrl} onPlay={this.onPlay} image={this.state.thumbnail} id="botr_UVQWMA4o_kGWxh33Q_div" playerId={this.state.playerId} ref={this.player} playerScript="https://cdn.jwplayer.com/libraries/HT7Dts3H.js">
                
            </ReactJWPlayer> : <div style={{textAlign: 'center'}}> 
                [Player] videoInfo not specified [Player]
            </div>}
        </React.Fragment>
    }
}
export default Player;