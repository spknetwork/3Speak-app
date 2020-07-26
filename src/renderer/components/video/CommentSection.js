import React, { Component } from 'react';
import PostComment from './PostComment';
import PromiseIpc from 'electron-promise-ipc';
import utils from '../../utils';

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
    async generateComments(reflink) {
        let totalComments = 0;
        let comments = [];
        for await(const rootComment of this.generateCommentGraph(reflink, () => {
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
        const children = await PromiseIpc.send("distiller.getChildren", startRoot, {asPost: true});
        for(const child of children) {
            let childComments = [];
            for await(const childComment of this.generateCommentGraph(child._id, progressHandler)) {
                childComments.push(childComment)
            }
            var childVideoInfo = await utils.accounts.permalinkToVideoInfo(child._id)
            const proc = <div key={child._id} className="box mb-3">
                <PostComment reflink={child._id} commentInfo={childVideoInfo}></PostComment>
                {childComments}
            </div>;
            yield proc;
            if(progressHandler) {
                progressHandler();
            }
        }
        return;
    }
    render() { 
        return (<React.Fragment>
            <h6 className="comment-count">Comments: ({this.state.totalComments})</h6>
            <div className="box mb-3">
                {
                    //Future comment editor box
                }
            </div>
            {
                this.state.commentGraph
            }
        </React.Fragment>);
    }
}
 
export default CommentSection;