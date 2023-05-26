import hive from '@hiveio/hive-js'
import { CommentOp } from '../../../common/models/comments.model'
import PromiseIPC from 'electron-promise-ipc'
import { HiveInfo } from '../../../common/models/hive.model'
import { IpfsService } from '../ipfs.service'
import ArraySearch from 'arraysearch'
export async function postComment(commentOp: CommentOp) {
  const Finder = ArraySearch.Finder
  switch (commentOp.accountType) {
    case 'hive': {
      const profileID = window.localStorage.getItem('SNProfileID') as any
      const getAccount = (await PromiseIPC.send('accounts.get', profileID)) as any
      const hiveInfo = Finder.one.in(getAccount.keyring).with({ type: 'hive' }) as HiveInfo

      console.log(`posting comment with profile ID`, profileID)
      console.log(`account`, getAccount)
      console.log(`hiveInfo`, hiveInfo)
      console.log(`comment op`, commentOp)

      if (!commentOp.json_metadata) {
        commentOp.json_metadata = {}
      }

      let json_metadata
      if (typeof commentOp.json_metadata === 'object') {
        //Note: this is for peakd/hive.blog to display a video preview
        if (!commentOp.parent_author) {
          commentOp.json_metadata.video.info = {
            author: hiveInfo.username,
            permlink: commentOp.permlink,
          }
        }
        json_metadata = JSON.stringify(commentOp.json_metadata)
      } else {
        throw new Error('commentOp.json_metadata must be an object')
      }

      let body: string

      if (!commentOp.parent_author) {
        let header: string
        if (commentOp.json_metadata.sourceMap) {
          const thumbnailSource = Finder.one.in(commentOp.json_metadata.sourceMap).with({
            type: 'thumbnail',
          })
          console.log(`thumbnail source`, thumbnailSource)
          try {
            const cid = IpfsService.urlToCID(thumbnailSource.url)
            const gateway = await IpfsService.getGateway(cid, true)
            const imgSrc = gateway + IpfsService.urlToIpfsPath(thumbnailSource.url)
            header = `[![](${imgSrc})](https://3speak.tv/watch?v=${hiveInfo.username}/${commentOp.permlink})<br/>`
          } catch (ex) {
            console.error(`Error getting IPFS info`, ex)
            throw ex
          }
        }
        if (header) {
          body = `${header} ${commentOp.body} <br/> [▶️Watch on 3Speak Dapp](https://3speak.tv/openDapp?uri=hive:${hiveInfo.username}:${commentOp.permlink})`
        } else {
          body = `${commentOp.body} <br/> [▶️Watch on 3Speak Dapp](https://3speak.tv/openDapp?uri=hive:${hiveInfo.username}:${commentOp.permlink})`
        }
      } else {
        body = commentOp.body
      }

      if (!json_metadata) {
        throw new Error(`Cannot publish comment to hive with no metadata!`)
      }
      console.log(`POSTING TO HIVE WITH JSON METADATA`, json_metadata)

      try {
        const out = await hive.broadcast.comment(
          hiveInfo.privateKeys.posting_key,
          commentOp.parent_author || '',
          commentOp.parent_permlink || commentOp.tags[0] || 'threespeak', //parentPermlink
          hiveInfo.username,
          commentOp.permlink,
          commentOp.title,
          body,
          json_metadata,
        )

        console.log(`comment broadcasted to hive!  return:`)
        console.log(out)

        return [`hive:${hiveInfo.username}:${commentOp.permlink}`, out]
      } catch (err) {
        console.error(`Error broadcasting comment to hive! ${err.message}`)
        throw err
      }
    }
  }
}