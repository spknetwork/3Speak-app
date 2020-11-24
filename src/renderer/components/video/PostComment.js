import React, { Component } from 'react';
import Utils from '../../utils';
import RefLink from '../../../main/RefLink'
import ReactMarkdown from 'react-markdown';
import { FaThumbsUp, FaThumbsDown, FaDollarSign, FaTimesCircle } from "react-icons/fa";
import { BsThreeDotsVertical } from 'react-icons/bs'
import { Dropdown } from 'react-bootstrap';
import Vote from "./Vote";
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
                        {/*<FaDollarSign className="fa fa-dollar-sign" /> <span id="" className="post-payout">{this.state.commentInfo.payout}</span>
                        <span id=""> • */}<Vote reflink={this.props.reflink} />{/* </span>*/}
                    </div>
                </div>
            </div>
        </div>);
    }
}

export default PostComment;