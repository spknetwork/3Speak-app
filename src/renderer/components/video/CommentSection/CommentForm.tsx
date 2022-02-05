import React, { useCallback, useRef, useState } from 'react'
import RefLink from '../../../../main/RefLink'
import randomstring from 'randomstring'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { AccountService } from '../../../services/account.service'

export function CommentForm(props) {
  const [postingStatus, setPostingStatus] = useState(false)
  const commentBodyRef = useRef() as any
  const { parent_reflink } = props

  const postComment = useCallback(async () => {
    setPostingStatus(true)
    const [networkId, parent_author, parent_permlink] = (RefLink.parse(parent_reflink) as any).link
    const [reflink, finishOpt] = await AccountService.postComment({
      accountType: 'hive',
      body: commentBodyRef.current.value,
      parent_author,
      parent_permlink,
      username: 'sisy',
      permlink: `re-${parent_permlink}-${randomstring
        .generate({
          length: 8,
          charset: 'alphabetic',
        })
        .toLowerCase()}`,
      title: '',
      json_metadata: {},
    })
    if (typeof props.onCommentPost === 'function') {
      props.onCommentPost()
    }
    commentBodyRef.current.value = ''
    setPostingStatus(false)
  }, [parent_reflink])
  return (
    <>
      <textarea
        id="new-comment-body"
        className="form-control w-100"
        ref={commentBodyRef}
        placeholder="Comment here..."
        maxLength={25000}
      ></textarea>
      <button
        id="new-comment-btn"
        className="btn mt-1 btn-primary float-right"
        disabled={postingStatus}
        onClick={postComment}
      >
        {postingStatus ? <FontAwesomeIcon icon={faSpinner} spin /> : <span>Comment</span>}
      </button>
    </>
  )
}
