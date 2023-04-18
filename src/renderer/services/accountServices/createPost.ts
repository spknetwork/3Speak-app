import { hive } from '@hiveio/hive-js'
export async function createPost(postOp) {
  switch (postOp.accountType) {
    case 'hive': {
      const theWif = postOp.wif

      hive.broadcast.comment(
        theWif,
        '',
        postOp.parentPermlink,
        postOp.author,
        postOp.permlink,
        postOp.title,
        postOp.body,
        postOp.jsonMetadata,
        function (error, succeed) {
          console.log('Bout to check')
          if (error) {
            console.error(error)
            console.error('Error encountered')
          }

          if (succeed) {
            console.log('succeed')
          }
        },
      )
    }
  }
}