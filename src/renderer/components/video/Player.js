import React from 'react';
import ReactJWPlayer from 'react-jw-player';
import mergeOptions from 'merge-options'
import PromiseIPC from 'electron-promise-ipc'
import queryString from 'query-string';
import utils from '../../utils';

class Player extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            playerId: Math.random(20).toString(),
            videoUrl: null,
            videoInfo: null
        }
        this.player = React.createRef()
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
    ExecUpdate() {
        this.fireUp()
        this.player.current.componentDidMount()
    }
    render() {
        return <React.Fragment>
            {this.state.videoUrl ? <ReactJWPlayer licenseKey="64HPbvSQorQcd52B8XFuhMtEoitbvY/EXJmMBfKcXZQU2Rnn" customProps={{playbackRateControls: true}}
            file={this.state.videoUrl} image={this.state.thumbnail} id="botr_UVQWMA4o_kGWxh33Q_div" playerId={this.state.playerId} ref={this.player} playerScript="https://cdn.jwplayer.com/libraries/JyghCNnw.js?v=3">
                
            </ReactJWPlayer> : <center> 
                [Player] videoInfo not specified [Player]
            </center>}
        </React.Fragment>
    }
}
export default Player;