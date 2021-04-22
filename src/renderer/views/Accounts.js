import React, {Component} from 'react';
import {Button} from "react-bootstrap";
import {Link} from "react-router-dom";
import hive from '../assets/img/hive.svg';
import utils from '../utils'
import ArraySearch from 'arraysearch';
const Finder = ArraySearch.Finder;

class Accounts extends Component {
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
        let accountsInit = await utils.acctOps.getAccounts();
        await accountsInit.forEach(obj => {
            accounts.push(obj.nickname)
        })
        if (accounts.length === 0) {
            this.setState({
                accountAdded: false
            })
        }
        const login = localStorage.getItem('SNProfileID')

        if (login) {
            const user = await utils.acctOps.getAccount(login);
            this.setState({
                login: user.nickname
            })
        }

        this.setState({
            accounts
        })
    }

    async handleAccountChange(acc) {
        //TODO: account switch
        const allAcc = await utils.acctOps.getAccounts();

        function search(nameKey, myArray){
            for (var i=0; i < myArray.length; i++) {
                if (myArray[i].nickname === nameKey) {
                    return myArray[i];
                }
            }
        }

        const theAcc = Finder.one.in(allAcc).with({
            nickname: acc
        });
        const profileID = theAcc._id;
        localStorage.setItem('SNProfileID', profileID);
        this.setState({
            login: theAcc.nickname
        })
    }

    render() {
        return(
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
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.accounts.map(acc => (
                        <tr>
                            <td>
                                <b className='pr-2'>@{acc}</b> <img className='float-right mr-2' src={hive} width={15} height={15}/>
                            </td>
                            <td>
                                <input type="checkbox" disabled checked/>
                            </td>
                            <td>
                                {acc === this.state.login && (
                                    <div className='py-3'>Currently active</div>
                                )}
                                {!(acc === this.state.login) && (
                                    <Button onClick={() => {this.handleAccountChange(acc)}} className='bg-dark'>
                                        Activate
                                    </Button>
                                )}
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