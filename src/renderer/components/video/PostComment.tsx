import React, { Component, useRef, useCallback } from 'react';
import Utils from '../../utils';
import RefLink from '../../../main/RefLink'
import ReactMarkdown from 'react-markdown';
import { FaThumbsUp, FaThumbsDown, FaDollarSign, FaTimesCircle } from "react-icons/fa";
import { BsThreeDotsVertical } from 'react-icons/bs'
import { Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Vote from "./Vote";
import DOMPurify from 'dompurify';
const electronIpc = require('electron-promise-ipc');
const { clipboard } = require('electron');
import ArraySearch from 'arraysearch';
const Finder = ArraySearch.Finder;
import { NotificationManager } from 'react-notifications';
import CommentSection from './CommentSection';
import randomstring from 'randomstring';
import Convert from 'convert-units';
import DateAndTime from 'date-and-time'


function NormaliseTime(val, unit) {
    return Math.round(Convert(val).from(unit).toBest().val) + Convert(val).from(unit).toBest().unit
}

function CommentForm(props) {
    const commentBodyRef = useRef() as any
    const { parent_reflink } = props
    console.log(parent_reflink)
    const postComment = useCallback(async () => {
        console.log("posting")
        console.log(commentBodyRef.current.value)
        console.log(parent_reflink)
        const [networkId, parent_author, parent_permlink] = (RefLink.parse(parent_reflink) as any).link
        console.log(parent_author, parent_permlink)
        let [reflink, finishOpt] = await Utils.acctOps.postComment({
            accountType: "hive",
            body: commentBodyRef.current.value,
            parent_author,
            parent_permlink,
            username: 'sisy',
            permlink: `re-${parent_permlink}-${randomstring.generate({
                length: 8,
                charset: 'alphabetic'
            }).toLowerCase()}`,
            title: ''
        })
        if(typeof props.onCommentPost === "function") {
            console.log(finishOpt.operations[1])
            props.onCommentPost();
        }
    }, [parent_reflink])
    return (<React.Fragment>
        <textarea id="new-comment-body" className="form-control w-100" ref={commentBodyRef} placeholder="Comment here..." maxLength={25000}>

        </textarea>
        <button id="new-comment-btn" className="btn mt-1 btn-primary float-right" onClick={postComment}>
            Comment
        </button>
    </React.Fragment>)
}

const CustomToggle = React.forwardRef(({ children, onClick }: any, ref: any) => (
    <a
        href=""
        ref={ref}
        onClick={(e) => {
            e.preventDefault();
            onClick(e);
        }}>
        <BsThreeDotsVertical />
        {children}
    </a>
));

/**
 * @todo Implement displaying numbers of comments and comment value. Requires support on backend to count votes.
 * @todo Implement interactibility.
 * @todo Implement 3 dot action menu.
 */
class PostComment extends Component<any,any> {
    constructor(props) {
        super(props);
        this.state = {
            commentInfo: {
                reflink: this.props.reflink ? this.props.reflink : null
            },
            replying: false
        };
        this.handleAction = this.handleAction.bind(this)
    }
    async componentDidMount() {
        console.log(this.props.reflink)
        let commentInfo;
        let profilePicture
        if (this.props.commentInfo) {
            commentInfo = this.props.commentInfo;
        } else {
            commentInfo = await Utils.accounts.permalinkToVideoInfo(this.props.reflink)
        }
        if (commentInfo) {
            profilePicture = await Utils.accounts.getProfilePictureURL(commentInfo.reflink)
            console.log(commentInfo)
            this.setState({
                commentInfo,
                profilePicture
            })
        }
    }
    async handleAction(eventKey) {
        const reflink = this.state.commentInfo.reflink;
        switch (eventKey) {
            case "block_post": {
                await electronIpc.send("blocklist.add", reflink, {
                    reason: "manual block"
                })
            }
            case "block_user": {
                var ref = RefLink.parse(reflink) as any as any
                await electronIpc.send("blocklist.add", `${ref.source.value}:${ref.root}`, {
                    reason: "manual block"
                })
            }
            case "copy_reflink": {
                clipboard.writeText(reflink, clipboard as any)
            }
            default: {

            }
        }
    }

    // function does not compile and is not referenced - commenting out for now
//     async postComment() {
//         const profileID = localStorage.getItem('SNProfileID');

//         if (profileID) {
//             const profile = await utils.acctOps.getAccount(profileID);
//             const accountType = 'hive';
//             const theWifObj = Finder.one.in(user.keyring).with({
//                 privateKeys: {}
//             })
//             const theWif = theWifObj.privateKeys.posting_key
//             const parentAuthor = ''; // ideally empty for blog posts
//             const parentPermlink = ''; // primary tag for the post
//             const author = ''; // creator account
//             const permlink = ''; // post permalink
//             const title = ''; // post title
//             const body = ''; // post body or description 
//             const jsonMetadata = { tags: [''], app: '' }

//             const commentOp = { wif, parentAuthor, parentPermlink, author, permlink, title, body, jsonMetadata, accountType }
//             console.log(theWif);
//             //await Utils.acctOps.postComment(commentOp)
//         } else {
//             NotificationManager.error('You need to be logged in to perform this operation')
//         }
//     }
    get postTimeDistance() {
        return NormaliseTime((new Date() as any) - (new Date(this.state.commentInfo.creation) as any), "ms")
    }
    get postTime() {
        return DateAndTime.format(new Date(this.state.commentInfo.creation), 'YYYY/MM/DD HH:mm:ss')
    }
    render() {
        console.log(this.props.onCommentPost)
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
                            <Dropdown.Item style={{ color: "red" }} eventKey="block_post">Block post</Dropdown.Item>
                            <Dropdown.Item style={{ color: "red" }} eventKey="block_user">Block user</Dropdown.Item>
                            <Dropdown.Item eventKey="copy_reflink">Copy to clipboard permlink</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
            <div className="col-12">
                <div className="panel ml-2 panel-default">
                    <div className="panel-heading ml-4">

                        <strong><a href={`#/user?=${this.props.reflink}`}>{RefLink.parse(this.props.reflink).root}</a> </strong>
                        • <span className="text-muted">
                            <OverlayTrigger
                                overlay={
                                    <Tooltip id="post-time">
                                        {this.postTime}
                                    </Tooltip>
                                }>
                                <div>{this.postTimeDistance}</div>
                            </OverlayTrigger></span>
                    </div>
                    <div className="panel-body mt-1">
                        <ReactMarkdown escapeHtml={false} source={DOMPurify.sanitize(this.state.commentInfo.description)}></ReactMarkdown>
                    </div>
                    <div className="panel-footer ml-0 ml-md-4">
                        {/*<FaDollarSign className="fa fa-dollar-sign" /> <span id="" className="post-payout">{this.state.commentInfo.payout}</span>
                        <span id=""> • */}
                        <hr />
                        <ul className="list-inline list-inline-separate">
                            <li className="list-inline-item"><Vote reflink={this.props.reflink} /></li>
                            <li className="list-inline-item" style={{ cursor: "pointer" }} onClick={(() => {
                                this.setState({
                                    replying: !this.state.replying
                                })
                            })}>
                                {
                                    this.state.replying ? "Cancel" : "Reply"
                                }
                            </li>
                        </ul>
                        {/* </span>*/}
                    </div>
                </div>
            </div>
            {
                this.state.replying ? <div className="box mb-3 clearfix"><CommentForm parent_reflink={this.props.reflink} 
                onCommentPost={this.props.onCommentPost}/></div> : null
            }
        </div>);
    }
}

export default PostComment;