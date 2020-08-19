import React, { Component } from 'react';
import { Table, Button } from 'react-bootstrap';
import PromiseIpc from 'electron-promise-ipc';

class Blocklist extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: []
        };
    }
    componentDidMount() {
        this.generate();
    }
    generate() {
        PromiseIpc.send("blocklist.ls", {}).then(value => {
            this.setState({
                list: value
            })
        })
    }
    handleRemove(reflink, rev) {
        PromiseIpc.send("blocklist.rm", reflink, rev);
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
                                    <Button variant="danger" onClick={() => this.handleRemove(value)}>X</Button>
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