import React, { Component, useCallback, useRef } from 'react';
import PostComment from './PostComment';
import PromiseIpc from 'electron-promise-ipc';
import utils from '../../utils';
import { Form } from 'react-bootstrap';
import './CommentSection.css'
import RefLink from '../../../main/RefLink'
import randomstring from 'randomstring'

function ConnectAccountNotice() {
    return (
        <p className="alert alert-info">To comment on this video please connect a HIVE account to your
        profile:
            &nbsp;<a href="#/login" class="keychainify-checked">Connect HIVE Account</a>
        </p>
    )
}

function NoComments() {
    return (
        <div class="alert alert-info">
            This video has no comments yet. To write a comment login and click the "Reply" button below the video player.
        </div>
    )
}

function CommentForm(props) {
    const commentBodyRef = useRef()
    const { parent_reflink } = props

    const postComment = useCallback(async() => {
        console.log("posting")
        console.log(commentBodyRef.current.value)
        console.log(parent_reflink)
        const [networkId, parent_author, parent_permlink] = RefLink.parse(parent_reflink).link
        console.log(parent_author, parent_permlink)
        await utils.acctOps.postComment({
            accountType: "hive",
            body: commentBodyRef.current.value,
            parent_author,
            parent_permlink,
            username: 'sisy',
            permlink: `re-${parent_permlink}-${randomstring.generate({
                length: 8,
                charset: 'alphabetic'
            }).toLowerCase()}}`,
            title: ''
        })
    }, [parent_reflink])
    return (<React.Fragment>
        <textarea id="new-comment-body" className="form-control w-100" ref={commentBodyRef} placeholder="Comment here..." maxLength="25000">

        </textarea>
        <button id="new-comment-btn" className="btn mt-1 btn-primary float-right" onClick={postComment}>
            Comment
        </button>
    </React.Fragment>)
}


class CommentSection extends Component {
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
        const children = await PromiseIpc.send("distiller.getChildren", startRoot, { asPost: true });
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
                    <PostComment reflink={child._id} commentInfo={childVideoInfo}></PostComment>
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
                <h6 class="text-muted">Reply:</h6>
                {
                    isLogged ? <CommentForm parent_reflink={this.props.reflink}/> : <ConnectAccountNotice />
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