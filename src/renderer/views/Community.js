import React, { Component } from 'react';
import codes, { by639_1, by639_2T, by639_2B } from 'iso-language-codes'
import RefLink from '../../main/RefLink'
import { Nav, Tabs, Tab } from 'react-bootstrap'
import GridFeed from './GridFeed'
import ReactMarkdown from 'react-markdown'
import axios from 'axios'
import Utils from '../utils'
const { Client: HiveClient } = require('@hiveio/dhive');
const client = new HiveClient('https://api.openhive.network');

class Community extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reflink: RefLink.parse(props.match.params.reflink),
            community_info: {

            },
            videos: {
                trending: [],
                new: []
            },
            backgroundUrl: null
        };
        console.log(client);
    }
    componentDidUpdate(prevProps) {
        if(prevProps.match.params.reflink !== this.props.match.params.reflink) {
            this.generate();
        }
    }
    async componentDidMount() {
        this.generate();
    }
    async generate() {
        this.setState({
            reflink: RefLink.parse(this.props.match.params.reflink)
        }, async () => {
            var community_info = await client.call("bridge", "get_community", { "name": this.state.reflink.root, "observer": "alice" });
            this.setState({
                community_info
            })
            //const trending = await client.call("bridge", "get_ranked_posts", { sort: "trending", tag: this.state.reflink.root, observer: "alice" })
            //const newVideos = await client.call("bridge", "get_ranked_posts", { sort: "created", tag: this.state.reflink.root, observer: "alice" })
            const trending = (await axios.get(`https://3speak.tv/apiv2/feeds/community/${this.state.reflink.root}/trending`)).data
            const newVideos = (await axios.get(`https://3speak.tv/apiv2/feeds/community/${this.state.reflink.root}/new`)).data
            this.setState({
                videos: {
                    trending,
                    new: newVideos
                },
                backgroundUrl: await Utils.accounts.getProfileBackgroundImage(this.props.match.params.reflink)
            })
        })
    }
    render() {
        return (<div>
            <div style={{ position: "relative", display: "inline-block", width: "100%", minHeight: "400px", backgroundAttachment: "fixed", backgroundSize: "cover", backgroundRepeat: "no-repeat", background: `url(${this.state.backgroundUrl})` }}>
                <img className="channel-profile-img" style={{ position: "absolute", bottom: "10px", left: "10px" }} alt="" src={`https://images.hive.blog/u/${this.state.reflink.root}/avatar`} />

                <h1 style={{ position: "absolute", bottom: "10px", left: "150px" }}><b style={{
                    color: "white",
                    textShadow: "-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000"
                }}>{this.state.community_info.title}</b>
                </h1>
            </div>
            <h4 className="mt-3">
                <ReactMarkdown source={this.state.community_info.about} />
            </h4>
            <p>{this.state.community_info.description}</p>

            <hr />
            <Tabs>
                <Tab eventKey="videos" title="Videos" variant="secondary">
                    <hr />
                    <Tabs>
                        <Tab eventKey="trending" title="Show Trending">
                            <h3 id="videoSectionHeading">Trending Videos</h3>
                            <hr />
                            <div>
                                {this.state.videos.trending !== null ? <GridFeed key="community-trends" type={`#${this.state.reflink.root}/trending`} /> : null}
                            </div>
                        </Tab>
                        <Tab eventKey="new" title="Show New">
                            <h3 id="videoSectionHeading">New Videos</h3>
                            <hr />
                            <div>
                                {this.state.videos.new !== null ? <GridFeed key="community-new" type={`#${this.state.reflink.root}/new`} /> : null}

                            </div>
                        </Tab>
                    </Tabs>
                </Tab>
                <Tab eventKey="polls" title="Polls">

                </Tab>
                <Tab eventKey="stats" title="Stats">
                    <div className="row">
                        <div className="card col-lg-6 col-md-11 col-sm-12 col-xs-11 col-xl-5 ml-2 mt-2">
                            <div className="card-header"><h3>More Info</h3></div>
                            <div className="card-body">
                                <h5>Language: {
                                    by639_1[this.state.community_info.lang] ? by639_1[this.state.community_info.lang].name : null
                                }</h5>
                                <h5>Community:</h5>

                                <b className="text-success">{this.state.community_info.num_pending}</b> posts waiting to cash out<br />
                                <b className="text-success">${this.state.community_info.sum_pending}</b> pending rewards<br />
                                <b className="text-success">{this.state.community_info.subscribers}</b> subscribers<br />
                                <p><b className="text-success">{this.state.community_info.num_authors}</b> active authors</p><br />
                                {
                                    this.state.community_info.is_nsfw === true ? <h5 className="text-danger">NSFW</h5> : <h5 className="text-success">Not NSFW</h5>
                                }
                            </div>
                        </div>
                        <div className="card col-lg-6 col-md-8 col-sm-10 col-xs-11 col-xl-5 ml-2 mt-2">
                            <div className="card-header"><h3>The team</h3></div>
                            <div className="card-body">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <td>User</td>
                                            <td>Role</td>
                                            <td>Nickname</td>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.community_info.team ? this.state.community_info.team.map(value => (
                                                <tr key={value[0]}>
                                                    <td><a href={`#/user/hive:${value[0]}`}>{value[0]}</a></td>
                                                    <td>{value[1]}</td>
                                                    <td>{value[2]}</td>
                                                </tr>
                                            )) : null
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Tab>
            </Tabs>
        </div>
        );
    }
}

export default Community;