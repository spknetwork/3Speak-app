import React, { Component } from 'react';
import { Button, Tooltip, OverlayTrigger } from "react-bootstrap";
import { Link } from "react-router-dom";
import hive from '../assets/img/hive.svg';
import utils from '../utils'
import ArraySearch from 'arraysearch';
const Finder = ArraySearch.Finder;

class Accounts extends Component<any,any> {
    constructor(props) {
        super(props)
        this.state = {
            accounts: [],
            login: false,
            accountAdded: true
        }
    }

    async componentDidMount() {
        //TODO: get accounts
        let accounts = []
        let accountsInit = await utils.acctOps.getAccounts() as any[];
        await accountsInit.forEach(obj => {
            accounts.push(obj)
        })
        if (accounts.length === 0) {
            this.setState({
                accountAdded: false
            })
        }
        const login = localStorage.getItem('SNProfileID')

        if (login) {
            const user = await utils.acctOps.getAccount(login) as any;
            this.setState({
                login: user.nickname
            })
        }

        this.setState({
            accounts
        })
    }

    async handleAccountChange(profileID) {
        const theAcc = await utils.acctOps.getAccount(profileID) as any;

        localStorage.setItem('SNProfileID', profileID);
        this.setState({
            login: theAcc.nickname
        })
    }
    async logOut(profileID) {
        await utils.acctOps.logout(profileID);
        let accountsInit = await utils.acctOps.getAccounts() as any[];
        console.log(accountsInit)
        if (accountsInit.length > 0) {
            localStorage.setItem('SNProfileID', accountsInit[0]._id)
        }
        window.location.reload();
    }
    render() {
        return (
            <div className='pl-4'>
                <h1>Your accounts</h1>
                <table className='mb-3'>
                    <thead>
                        <tr>
                            <th>
                                Account
                        </th>
                            <th className={'pr-2'}>
                                Encrypted
                        </th>
                            <th>
                                Active
                        </th>
                            <th>
                                Remove
                        </th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.accounts.map(({ keyring, nickname, _id }) => (
                            <tr>
                                <td>
                                    <b className='pr-2'>@{nickname}</b>
                                    {(() => {
                                        console.log(keyring)
                                    })()}
                                    {
                                        keyring.map(baseInfo =>
                                            <OverlayTrigger key={baseInfo.username}
                                            placement={"top"}
                                            overlay={
                                                <Tooltip id={`tooltip-${baseInfo.username}`} >{baseInfo.username}</Tooltip >
                                              }>
                                                <img className='float-right mr-2' src={hive} width={15} height={15} />
                                            </OverlayTrigger >)
                                    }

                                </td>
                                <td>
                                    <input type="checkbox" disabled />
                                </td>
                                <td>
                                    {nickname === this.state.login && (
                                        <div className='py-3'>Currently active</div>
                                    )}
                                    {!(nickname === this.state.login) && (
                                        <Button onClick={() => { this.handleAccountChange(_id) }} className='bg-dark'>
                                            Activate
                                        </Button>
                                    )}
                                </td>
                                <td>
                                    <Button onClick={() => { this.logOut(_id) }} className='bg-dark'>
                                        Remove
                                </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {!(this.state.accountAdded) && (<p>You need to add an account first</p>)}
                <Link to='/login'>Add new account</Link>
            </div>
        )
    }
}

export default Accounts