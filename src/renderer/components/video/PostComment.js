import React, { Component } from 'react';
import Utils from '../../utils';
import RefLink from '../../../main/RefLink'
import ReactMarkdown from 'react-markdown';
import { FaThumbsUp, FaThumbsDown, FaDollarSign, FaTimesCircle } from "react-icons/fa";
import { BsThreeDotsVertical } from 'react-icons/bs'
import { Dropdown } from 'react-bootstrap';
import DOMPurify from 'dompurify';
const electronIpc = require('electron-promise-ipc');
const { clipboard } = require('electron');

const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <a
        href=""
        ref={ref}
        onClick={(e) => {
            e.preventDefault();
            onClick(e);
        }}>
        <BsThreeDotsVertical/>
        {children}      
    </a>
));

/**
 * @todo Implement displaying numbers of comments and comment value. Requires support on backend to count votes.
 * @todo Implement interactibility.
 * @todo Implement 3 dot action menu.
 */
class PostComment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            commentInfo: {
                reflink: this.props.reflink ? this.props.reflink : null
            }
        };
        this.handleAction = this.handleAction.bind(this)
    }
    async componentDidMount() {
        let commentInfo;
        let profilePicture
        if (this.props.commentInfo) {
            commentInfo = this.props.commentInfo;
        } else {
            commentInfo = await Utils.accounts.permalinkToVideoInfo(this.props.reflink)
        }
        if (commentInfo) {
            profilePicture = await Utils.accounts.getProfilePictureURL(commentInfo.reflink)
            this.setState({
                commentInfo,
                profilePicture
            })
        }
    }
    async handleAction(eventKey) {
        const reflink = this.state.commentInfo.reflink;
        switch(eventKey) {
            case "block_post": {
                await electronIpc.send("blocklist.add", reflink, {
                    reason: "manual block"
                })
            }
            case "block_user": {
                var ref = RefLink.parse(reflink)
                await electronIpc.send("blocklist.add", `${ref.source.value}:${ref.root}`, {
                    reason: "manual block"
                })
            }
            case "copy_reflink": {
                clipboard.writeText(reflink, clipboard)
            }
            default: {
                
            }
        }
    }
    render() {
        return (<div>
            <div className="col">
                <div className="thumbnail mr-2 float-left">
                    <img className="img-responsive user-photo" width="24" src={this.state.profilePicture} />
                </div>
            </div>
            <div className="col" style={{ "zIndex": 1000 }}>
                <div className="mr-3 float-right">
                    <Dropdown onSelect={this.handleAction}>
                        <Dropdown.Toggle as={CustomToggle}>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Item style={{color:"red"}} eventKey="block_post">Block post</Dropdown.Item>
                            <Dropdown.Item style={{color:"red"}} eventKey="block_user">Block user</Dropdown.Item>
                            <Dropdown.Item eventKey="copy_reflink">Copy to clipboard permlink</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
            <div className="col-12">
                <div className="panel ml-2 panel-default">
                    <div className="panel-heading ml-4">

                        <strong><a href={`#/user?=${this.props.reflink}`}>{RefLink.parse(this.props.reflink).root}</a> </strong>• <span className="text-muted">6 days ago</span>
                    </div>
                    <div className="panel-body mt-1">
                        <ReactMarkdown escapeHtml={false} source={DOMPurify.sanitize(this.state.commentInfo.description)}></ReactMarkdown>
                    </div>
                    <div className="panel-footer ml-0 ml-md-4">
                        <FaDollarSign className="fa fa-dollar-sign" /> <span id="" className="post-payout">0.03</span>

                        <span id=""> •
                            <span className="steem-like btn-light btn-sm ml-2 p-0" id="" data-upvote="" data-created="6 days ago">
                                <span className="steem-like-icon" style={{ cursor: "pointer" }}>
                                    <FaThumbsUp id="up-icon-aperterikk-re-silentscreamer-qditcv" className="steem-like-icon-icon text-secondary" />
                                </span>

                                <div className="slider slider-horizontal d-none" id=""><div className="slider-track"><div className="slider-track-low" style={{ left: "0px", width: "0%" }}></div><div className="slider-selection" style={{ left: "0%", width: "100%", background: "rgb(0, 85, 130)" }}></div><div className="slider-track-high" style={{ right: "0px", width: "0%" }}></div></div><div className="tooltip tooltip-main top" role="presentation" style={{ left: "100%" }}><div className="tooltip-arrow"></div><div className="tooltip-inner">100</div></div><div className="tooltip tooltip-min top" role="presentation"><div className="tooltip-arrow"></div><div className="tooltip-inner"></div></div><div className="tooltip tooltip-max top" role="presentation" style={{}}><div className="tooltip-arrow"></div><div className="tooltip-inner"></div></div><div className="slider-handle min-slider-handle round" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100" tabindex="0" style={{ left: "100%" }}></div><div className="slider-handle max-slider-handle round hide" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0" style={{ left: "0%" }}></div></div><input id="slider-input-aperterikk-re-silentscreamer-qditcv-up" className="steem-upvote-slider" data-slider-id="slider-aperterikk-re-silentscreamer-qditcv-up" type="text" data-slider-min="0" data-slider-max="100" data-slider-step="1" data-slider-value="100" data-value="100" value="100" style={{ display: "none" }} />
                                <span className="steem-upvote-val ml-2 d-none">100%</span>
                                <i data-post="" style={{ cursor: "pointer" }} className="fa fa-lg fa-chevron-circle-up d-none steem-upvote-cast"></i>
                                <FaTimesCircle style={{ cursor: "pointer" }} className="text-danger d-none steem-upvote-cancel"></FaTimesCircle>
                            </span>
                            <span className="likes p-1" style={{ cursor: "pointer" }} data-likes="" data-toggle="popover" data-trigger="click" data-html="true" data-placement="bottom" title="" data-content="<a href='https://peakd.com/@felix.herrmann' target='_blank'>@felix.herrmann</a>: 100%<br><a href='https://peakd.com/@silentscreamer' target='_blank'>@silentscreamer</a>: 100%<br><a id='upvotes|aperterikk|re-silentscreamer-qditcv' className='seemore'>See more...</span>" data-original-title="Upvoters">
                                <b>
                                    0
                                </b>
                            </span>

                            <span className="steem-like btn-light btn-sm ml-2 p-0" id="n" data-upvote="" data-created="6 days ago">
                                <span className="steem-like-icon" style={{ cursor: "pointer" }}>
                                    <FaThumbsDown id="" className="steem-like-icon-icon text-secondary" />
                                </span>

                                <div className="slider slider-horizontal d-none" id="slider-aperterikk-re-silentscreamer-qditcv-down"><div className="slider-track"><div className="slider-track-low" style={{ left: "0px", width: "0%" }}></div><div className="slider-selection" style={{ left: "0%", width: "100%", background: "rgb(0, 85, 130)" }}></div><div className="slider-track-high" style={{ right: "0px", width: "0%" }}></div></div><div className="tooltip tooltip-main top" role="presentation" style={{ left: "100%" }}><div className="tooltip-arrow"></div><div className="tooltip-inner">100</div></div><div className="tooltip tooltip-min top" role="presentation"><div className="tooltip-arrow"></div><div className="tooltip-inner"></div></div><div className="tooltip tooltip-max top" role="presentation" style={{}}><div className="tooltip-arrow"></div><div className="tooltip-inner"></div></div><div className="slider-handle min-slider-handle round" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100" tabindex="0" style={{ left: "100%" }}></div><div className="slider-handle max-slider-handle round hide" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0" tabindex="0" style={{ left: "0%" }}></div></div><input id="slider-input-aperterikk-re-silentscreamer-qditcv-down" className="steem-upvote-slider" data-slider-id="slider-aperterikk-re-silentscreamer-qditcv-down" type="text" data-slider-min="0" data-slider-max="-100" data-slider-step="1" data-slider-value="-100" data-value="100" value="100" style={{ display: "none" }} />
                                <span className="steem-upvote-val ml-2 d-none">100%</span>
                                <i data-post="" style={{ cursor: "pointer" }} className="fas fa-lg fa-chevron-circle-down d-none steem-downvote-cast"></i>
                                <FaTimesCircle style={{ cursor: "pointer" }} className="text-danger d-none steem-upvote-cancel"></FaTimesCircle>
                            </span>
                            <span className="likes p-1" style={{ cursor: "pointer" }} data-dislikes="" data-toggle="popover" data-trigger="click" data-html="true" data-placement="bottom" title="" data-content="<a href='https://peakd.com/@dein-problem' target='_blank'>@dein-problem</a>: -1%<br><a id='downvotes|aperterikk|re-silentscreamer-qditcv' className='seemore'>See more...</a>" data-original-title="Downvoters">
                                <b>0</b>
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </div>);
    }
}

export default PostComment;