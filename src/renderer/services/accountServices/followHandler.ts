import { hive } from '@hiveio/hive-js'
import ArraySearch from 'arraysearch'
export async function followHandler(profileID, followOp) {
  const Finder = ArraySearch.Finder
  switch (followOp.accountType) {
    case 'hive': {
      //const profile = await acctOps.getAccount(profileID);
      const profile = (await this.getAccount(profileID)) as any

      const username = Finder.one.in(profile.keyring).with({ type: 'hive' }).username
      const theWifObj = Finder.one.in(profile.keyring).with({
        type: 'hive',
      })
      const wif = theWifObj.privateKeys.posting_key // posting key
      const jsonObj = [
        'follow',
        {
          follower: username,
          following: followOp.author,
          what: followOp.what ? [followOp.what] : [],
        },
      ]

      // console.log(
      hive.broadcast.customJson(
        wif,
        [],
        [username],
        'follow',
        JSON.stringify(jsonObj),
        async (error, succeed) => {
          if (error) {
            console.error(error)
            console.error('Error encountered broadcsting custom json')
          }

          if (succeed) {
            console.log(succeed)
            console.log('success broadcasting custom json')
          }
        },
      )
      // )
    }
  }
}