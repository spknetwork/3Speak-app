import React, { useEffect, useMemo, useState } from 'react'
import PromiseIpc from 'electron-promise-ipc'
import './CommentSection/CommentSection.css'
import { ConnectAccountNotice } from './CommentSection/ConnectAccountNotice'
import { CommentForm } from './CommentSection/CommentForm'
import { NoComments } from './CommentSection/NoComments'
import { AccountService } from '../../services/account.service'
import { PostComment } from './PostComment'

export function CommentSection(props: any) {
  const [commentGraph, setCommentGraph] = useState<any[]>([])
  const [totalComments, setTotalComments] = useState(0)

  const generateComments = async (reflink) => {
    let count = 0
    const comments = []
    for await (const rootComment of generateCommentGraph(reflink, () => {
      count++
    })) {
      comments.push(rootComment)
    }
    setCommentGraph(comments)
    setTotalComments(count)
  }
  useEffect(() => {
    void generateComments(props.reflink)
  }, [props.reflink])

  /**
   * Generates a html graph of the comments
   * @param {String} startRoot
   * @param {Function} progressHandler
   */
  async function* generateCommentGraph(startRoot, progressHandler) {
    const children = (await PromiseIpc.send('distiller.getChildren', startRoot, {
      asPost: true,
    })) as any[]
    for (const child of children) {
      const childComments = []
      for await (const childComment of generateCommentGraph(child._id, progressHandler)) {
        childComments.push(childComment)
      }

      try {
        const childVideoInfo = await AccountService.permalinkToVideoInfo(child._id)
        const proc = (
          <div key={child._id} className="box mb-3">
            <PostComment
              reflink={child._id}
              commentInfo={childVideoInfo}
              onCommentPost={async (commentData) => {
                const childVideoInfo = await AccountService.permalinkToVideoInfo(commentData)
              }}
            ></PostComment>
            {childComments}
          </div>
        )
        yield proc
        if (progressHandler) {
          progressHandler()
        }
      } catch (ex) {
        console.error(ex)
        continue
      }
    }
  }

  const isLogged = useMemo(() => {
    return !!localStorage.getItem('SNProfileID')
  }, [])

  return (
    <>
      <h6 className="comment-count">Comments: ({totalComments})</h6>
      <div className="box mb-3 clearfix">
        <h6 className="text-muted">Reply:</h6>
        {isLogged ? (
          <CommentForm
            parent_reflink={props.reflink}
            onCommentPost={(commentData) => {
              console.log(commentData)
            }}
          />
        ) : (
          <ConnectAccountNotice />
        )}
      </div>
      {totalComments === 0 ? <NoComments /> : commentGraph}
    </>
  )
}
