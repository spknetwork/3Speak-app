import React, {Component} from 'react';
import {Button} from "react-bootstrap";
import {Link} from "react-router-dom";
import hive from '../assets/img/hive.svg';

class Accounts extends Component {
    constructor(props) {
        super(props)
        this.state = {
            accounts: [],
            login: 'test2'
        }
    }

    componentDidMount() {
        //TODO: get accounts
        let accounts = ['username1', 'test2', 'etc3', 'anoitheeeeeeeeeeeeeer'];

        this.setState({
            accounts
        })
    }

    handleAccountChange(acc) {
        //TODO: account switch
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
                                    <Button onClick={this.handleAccountChange(acc)} className='bg-dark'>
                                        Activate
                                    </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

                <Link to='/login'>Add new account</Link>
            </div>
        )
    }
}

export default Accounts