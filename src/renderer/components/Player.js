import React from 'react';
import ReactJWPlayer from 'react-jw-player';
import mergeOptions from 'merge-options'
import PromiseIPC from 'electron-promise-ipc'
import queryString from 'query-string';
import utils from '../utils';

class Player extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            playerId: Math.random(20).toString(),
            videoInfo: null
        }
    }
    async componentDidMount() {
        // hive/vaultec81/myPostId
        let permalink;
        if(this.props.permalink) {
            permalink = this.props.permalink;
        } else {
            permalink = queryString.parse(location.search).v
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
                tags: ["test_video", "first_video"],
                refs: ['SourceSystem/accountName/permlink'], //(Reflink) Reserved for future use when multi account system support is added.
                meta: {} //Anything non essential can be specfied here
            }
            videoInfo = this.props.videoInfo;
        } else {
            //Generate videoInfo from permalink
            if(permalink) {
                videoInfo = await utils.accounts.permalinkToVideoInfo(permalink);
            }
        }
        this.setState({
            videoInfo
        })
    }
    render() {
        return <React.Fragment>
            {this.state.videoInfo ? <ReactJWPlayer licenseKey="64HPbvSQorQcd52B8XFuhMtEoitbvY/EXJmMBfKcXZQU2Rnn" customProps={{playbackRateControls: true}}
            file={this.state.videoInfo.sources.video.url} id="botr_UVQWMA4o_kGWxh33Q_div" playerId={this.state.playerId} playerScript="https://cdn.jwplayer.com/libraries/JyghCNnw.js?v=3">
                
            </ReactJWPlayer> : <center>
                [Player] videoInfo not specified
            </center>}
        </React.Fragment>
    }
}
export default Player;