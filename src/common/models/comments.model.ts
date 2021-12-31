export interface CommentOp {
  accountType: string
  body: any
  parent_author?: string
  parent_permlink?: string
  username?: string
  permlink: string
  title: string
  json_metadata: any
  tags?: string[]
}
