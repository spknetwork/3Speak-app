import React, { Component, useCallback, useRef, useState } from 'react';
import PostComment from './PostComment';
import PromiseIpc from 'electron-promise-ipc';
import utils from '../../utils';
import './CommentSection.css'
import RefLink from '../../../main/RefLink'
import randomstring from 'randomstring'
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";


function ConnectAccountNotice() {
    return (
        <p className="alert alert-info">To comment on this video please connect a HIVE account to your
        profile:
            &nbsp;<a href="#/login" className="keychainify-checked">Connect HIVE Account</a>
        </p>
    )
}

function NoComments() {
    return (
        <div className="alert alert-info">
            This video has no comments yet. To write a comment login and click the "Reply" button below the video player.
        </div>
    )
}

function CommentForm(props) {
    const [postingStatus, setPostingStatus] = useState(false)
    const commentBodyRef = useRef() as any
    const { parent_reflink } = props

    const postComment = useCallback(async() => {
        setPostingStatus(true)
        console.log("posting")
        console.log(commentBodyRef.current.value)
        console.log(parent_reflink)
        const [networkId, parent_author, parent_permlink] = (RefLink.parse(parent_reflink) as any).link
        console.log(parent_author, parent_permlink)
        let [reflink, finishOpt] = await utils.acctOps.postComment({
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
            console.log(finishOpt.operations[0][1])
            props.onCommentPost();
        }
        commentBodyRef.current.value = "";
        setPostingStatus(false)
    }, [parent_reflink])
    return (<React.Fragment>
        <textarea id="new-comment-body" className="form-control w-100" ref={commentBodyRef} placeholder="Comment here..." maxLength={25000}>

        </textarea>
        <button id="new-comment-btn" className="btn mt-1 btn-primary float-right" disabled={postingStatus} onClick={postComment}>
            {postingStatus ? <FontAwesomeIcon icon={faSpinner} spin /> : <span>Comment</span> }
        </button>
    </React.Fragment>)
}


class CommentSection extends Component<any,any> {
    constructor(props) {
        super(props);
        this.state = {
            commentGraph: null,
            totalComments: 0
        }
    }
    componentDidMount() {
        this.generateComments(this.props.reflink);
    }
    componentDidUpdate(prevProps) {
        if (this.props.reflink !== prevProps.reflink) {
            // Handle path changes
            this.generateComments(this.props.reflink);
        }
    }
    async generateComments(reflink) {
        let totalComments = 0;
        let comments = [];
        for await (const rootComment of this.generateCommentGraph(reflink, () => {
            totalComments++;
        })) {
            comments.push(rootComment);
        }
        this.setState({
            commentGraph: comments,
            totalComments
        })
    }
    /**
     * Generates a html graph of the comments
     * @param {String} startRoot
     * @param {Function} progressHandler 
     */
    async *generateCommentGraph(startRoot, progressHandler) {
        const children = await PromiseIpc.send("distiller.getChildren", startRoot, { asPost: true }) as any[];
        for (const child of children) {
            /*if ((await PromiseIpc.send("blocklist.has", child._id))) {
                //Comment blocking; Stop working on this tree.
                //Add warning for lower level blocks later on.
                continue;
            }*/
            let childComments = [];
            for await (const childComment of this.generateCommentGraph(child._id, progressHandler)) {
                console.log(childComment)
                childComments.push(childComment)
            }
            console.log("pass 111")

            try {
                var childVideoInfo = await utils.accounts.permalinkToVideoInfo(child._id)
                console.log(childVideoInfo)
                const proc = <div key={child._id} className="box mb-3">
                    <PostComment reflink={child._id} commentInfo={childVideoInfo} onCommentPost={async (commentData) => {
                        console.log(commentData)
                        var childVideoInfo = await utils.accounts.permalinkToVideoInfo(commentData)

                    }}></PostComment>
                    {childComments}
                </div>;
                yield proc;
                if (progressHandler) {
                    progressHandler();
                }
            } catch (ex) {
                console.log(ex)
                continue;
            }
        }
    }
    render() {
        var isLogged = !!localStorage.getItem("SNProfileID")
        return (<React.Fragment>
            <h6 className="comment-count">Comments: ({this.state.totalComments})</h6>
            <div className="box mb-3 clearfix">
                <h6 className="text-muted">Reply:</h6>
                {
                    isLogged ? <CommentForm parent_reflink={this.props.reflink} onCommentPost={(commentData) => {
                        console.log(commentData)
                    }}/> : <ConnectAccountNotice />
                }

            </div>
            {
                this.state.totalComments === 0 ? <NoComments /> : this.state.commentGraph
            }
        </React.Fragment>);
    }
    static CommentForm() {
        return CommentForm;
    }
}
export default CommentSection;