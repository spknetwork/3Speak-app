import React from 'react';
import ReactJWPlayer from 'react-jw-player';
import mergeOptions from 'merge-options'
import PromiseIPC from 'electron-promise-ipc'
import queryString from 'query-string';

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
                source: "ipfs", // or URL
                format: "hls", // or ["mp4", "webm"]
                url: "", //Full URL or IPFS CID
                thumbnail: "", //Full URL can be IPFS URL or http
                title: "My video title",
                duration: 15 //Duration as number in s.ms format
            }
            videoInfo = this.props.videoInfo;
        } else {
            //Generate videoInfo from permalink
            if(permalink) {
                var post_content = await PromiseIPC.send("postdb.fetch", permalink);
                if(post_content.json_content.json_metadata) {
                    const json_metadata = JSON.parse(post_content.json_content.json_metadata);
                    const video_info = json_metadata.video.info;
                    videoInfo = {
                        source: "URL", //Reserved for URL/IPFS differentiation. 
                        format: video_info.file.split(".")[1], //Reserved if a different player must be used on a per format basis.
                        url: `https://cdn.3speakcontent.online/${video_info.permlink}/${video_info.file}`,
                        duration: video_info.duration,
                        title: video_info.title
                    }
                }
            }
        }
        this.setState({
            videoInfo
        })
    }
    render() {
        return <React.Fragment>
            {this.state.videoInfo ? <ReactJWPlayer licenseKey="64HPbvSQorQcd52B8XFuhMtEoitbvY/EXJmMBfKcXZQU2Rnn" customProps={{playbackRateControls: true}}
            file={this.state.videoInfo.url} id="botr_UVQWMA4o_kGWxh33Q_div" playerId={this.state.playerId} playerScript="https://cdn.jwplayer.com/libraries/JyghCNnw.js?v=3">
                
            </ReactJWPlayer> : <center>
                [Player] videoInfo not specified
            </center>}
        </React.Fragment>
    }
}
export default Player;