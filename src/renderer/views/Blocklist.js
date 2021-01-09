import React, { Component } from 'react';
import { Table, Button } from 'react-bootstrap';
import PromiseIpc from 'electron-promise-ipc';
import {NotificationManager} from 'react-notifications'

class Blocklist extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: []
        };
    }
    componentDidMount() {
        document.title = "3Speak - Tokenised video communities"
        this.generate();
    }
    generate() {
        PromiseIpc.send("blocklist.ls", {}).then(value => {
            this.setState({
                list: value
            })
        })
    }
    async handleRemove(reflink) {
        await PromiseIpc.send("blocklist.rm", reflink);
        NotificationManager.success(`Unblocked ${reflink}`);
        this.generate()
    }
    render() {
        return (<div>
            <Table responsive>
                <thead>
                    <tr>
                        <th>Reflink</th>
                        <th>Reason</th>
                        <th>Remove?</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        this.state.list.map(value => (
                            <tr key={value._id}>
                                <td>{value._id}</td>
                                <td>{value.reason}</td>
                                <td>
                                    <Button variant="danger" onClick={() => this.handleRemove(value._id)}>X</Button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        </div>);
    }
}
export default Blocklist;