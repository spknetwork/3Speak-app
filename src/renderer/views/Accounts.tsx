import ArraySearch from 'arraysearch'
import React, { useEffect, useState } from 'react'
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import hive from '../assets/img/hive.svg'
import { AccountService } from '../services/account.service'

const Finder = ArraySearch.Finder

export function AccountsView() {
  const [accounts, setAccounts] = useState([])
  const [login, setLogin] = useState('')
  const [accountAdded, setAccountAdded] = useState(true)

  useEffect(() => {
    const load = async () => {
      const accounts = []
      const accountsInit = (await AccountService.getAccounts()) as any[]
      accountsInit.forEach((obj) => {
        accounts.push(obj)
      })
      if (accounts.length === 0) {
        setAccountAdded(false)
      }
      const login = localStorage.getItem('SNProfileID')

      if (login) {
        const user = (await AccountService.getAccount(login)) as any
        setLogin(user.nickname)
      }

      setAccounts(accounts)
    }

    void load()

    //TODO: get accounts
  }, [])

  const handleAccountChange = async (profileID: string) => {
    const theAcc = (await AccountService.getAccount(profileID)) as any

    localStorage.setItem('SNProfileID', profileID)
    setLogin(theAcc.nickname)
  }

  const logOut = async (profileID: string) => {
    await AccountService.logout(profileID)
    const accountsInit = (await AccountService.getAccounts()) as any[]

    if (accountsInit.length > 0) {
      localStorage.setItem('SNProfileID', accountsInit[0]._id)
    } else {
      localStorage.removeItem('SNProfileID')
    }
    window.location.reload()
  }

  return (
    <div className="pl-4">
      <h1>Your accounts</h1>
      <table className="mb-3">
        <thead>
          <tr>
            <th>Account</th>
            <th className={'pr-2'}>Encrypted</th>
            <th>Active</th>
            <th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map(({ keyring, nickname, _id }) => (
            <tr>
              <td>
                <b className="pr-2">@{nickname}</b>
                {keyring.map((baseInfo) => (
                  <OverlayTrigger
                    key={baseInfo.username}
                    placement={'top'}
                    overlay={
                      <Tooltip id={`tooltip-${baseInfo.username}`}>{baseInfo.username}</Tooltip>
                    }
                  >
                    <img className="float-right mr-2" src={hive} width={15} height={15} />
                  </OverlayTrigger>
                ))}
              </td>
              <td>
                <input type="checkbox" disabled />
              </td>
              <td>
                {nickname === login && <div className="py-3">Currently active</div>}
                {!(nickname === login) && (
                  <Button
                    onClick={() => {
                      void handleAccountChange(_id)
                    }}
                    className="bg-dark"
                  >
                    Activate
                  </Button>
                )}
              </td>
              <td>
                <Button
                  onClick={() => {
                    void logOut(_id)
                  }}
                  className="bg-dark"
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!accountAdded && <p>You need to add an account first</p>}
      <Link to="/login">Add new account</Link>
    </div>
  )
}
