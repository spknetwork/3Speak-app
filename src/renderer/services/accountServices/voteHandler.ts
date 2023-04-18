import { hive } from '@hiveio/hive-js'

export async function voteHandler(voteOp) {
  switch (voteOp.accountType) {
    case 'hive': {
      const weight = voteOp.weight * 100
      const theWif = voteOp.wif
      hive.broadcast.vote(
        theWif,
        voteOp.voter,
        voteOp.author,
        voteOp.permlink,
        weight,
        function (error, succeed) {
          if (error) {
            console.error(error)
            console.error('Error encountered')
          }

          if (succeed) {
            console.log('vote broadcast successfully')
          }
        },
      )
    }
  }
}