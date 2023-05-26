import hive from '@hiveio/hive-js'
import PromiseIPC from 'electron-promise-ipc'
import ArraySearch from 'arraysearch'

const Finder = ArraySearch.Finder

export async function login(data) {
  switch (data.accountType) {
    case 'hive': {
      const userAccounts = await hive.api.getAccountsAsync([data.username])
      console.log(`got hive account for username ${data.username}`, userAccounts)
      const pubWif = userAccounts[0].posting.key_auths[0][0]

      const Valid = hive.auth.wifIsValid(data.key, pubWif)

      if (Valid) {
        const profile = {
          _id: userAccounts[0].id.toString(),
          nickname: data.profile,
          keyring: [
            {
              type: 'hive',
              username: data.username,
              public: {
                pubWif,
              },
              encrypted: data.encrypted,
              privateKeys: {
                posting_key: data.key,
              },
            },
          ],
        }
        const profileID = profile._id
        const check_profile = await PromiseIPC.send('accounts.has', profileID)
        if (check_profile) {
          throw new Error('Account exists already')
        } else {
          // 2nd argument doesn't match function signature - marking with any
          await PromiseIPC.send('accounts.createProfile', profile as any)
          const get_profile = await PromiseIPC.send('accounts.get', profileID)
          localStorage.setItem('SNProfileID', profileID)
          return get_profile
        }
      } else {
        throw new Error('Invalid posting key')
      }
    }
  }
}