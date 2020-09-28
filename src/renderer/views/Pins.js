import React, { Component } from 'react';
import PromiseIpc from 'electron-promise-ipc';
import {Table} from 'react-bootstrap';
import Convert from 'convert-units'
class Pins extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            pinls: []
        }
    }
    async componentDidMount() {
        var pinls = await PromiseIpc.send("pins.ls")
        console.log(pinls)
        this.setState({
            pinls
        })
    }
    render() { 
        let rows = [];
        for(var pin of this.state.pinls) {
            //Create human friendly siez string
            var sizeBest = Math.round(Convert(pin.size).from("B").toBest().val) + Convert(pin.size).from("B").toBest().unit
            rows.push(<tr key={pin._id}>
                <td>
                    <a href={`#/watch/${pin._id}`}>{pin._id}</a>
                </td>
                <td>
                    {pin.cids.length > 1 ? <a>View ({pin.cids.length})</a> : pin.cids }
                </td>
                <td>
                    {pin.source}
                </td>
                <td>
                    {pin.expire ? (() => {
                        console.log(pin.expire)
                        return "In " + Math.round(Convert(pin.expire - (new Date() / 1)).from("ms").toBest().val) + Convert(pin.expire - (new Date() / 1)).from("ms").toBest().unit
                    })(): "Permanent"}
                </td>
                <td>
                    {pin.size === 0 ? "" : sizeBest}
                </td>
            </tr>);
        } 
        return ( <div>
            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                        <th>Reflink</th>
                        <th>CID(s)</th>
                        <th>Source</th>
                        <th>Expiration</th>
                        <th>Size</th>
                        <th>Remove?</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </Table>
        </div> );
    }
}
 
export default Pins;