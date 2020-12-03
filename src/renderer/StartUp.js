import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import PromiseIpc from 'electron-promise-ipc';
import "./css/Startup.css";

class StartUp extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            message: null
        };
    }
    async componentDidMount() {
        var backendStatus = await PromiseIpc.send("core.status");
        if(backendStatus.ready === false) {
            this.setState({ show: true })
            var pid = setInterval(async() => {
                var status = await PromiseIpc.send('core.status')
                this.setState({
                    message: status.start_progress.message
                })
            }, 25)
            PromiseIpc.send("core.ready").then((eda) => {
                this.setState({show:false})
                clearInterval(pid);
            })
        }
    }
    render() {
        return (<div>
            <Modal show={this.state.show} backdrop={'static'} backdropClassName={"start-backdrop"}>
                <Modal.Header>
                    <Modal.Title>App Starting Up</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <center>
                        <h1 style={{paddingTop: "50px"}}>
                            Loading
                        </h1>
                        <hr/>
                        <p style={{fontSize: "15px"}}>
                            {this.state.message}
                        </p>
                    </center>
                </Modal.Body>
            </Modal>
        </div>);
    }
}
export default StartUp;