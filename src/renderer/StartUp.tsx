import React, { Component } from 'react';
import { Modal } from 'react-bootstrap';
import PromiseIpc from 'electron-promise-ipc';
import "./css/Startup.css";

class StartUp extends Component<any,any> {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            message: null
        };
    }
    async componentDidMount() {
        var backendStatus = await PromiseIpc.send("core.status", undefined as any) as any;
        if(backendStatus.ready === false) {
            this.setState({ show: true })
            var pid = setInterval(async() => {
                var status = await PromiseIpc.send('core.status', undefined as any) as any
                this.setState({
                    message: status.start_progress.message
                })
            }, 25)
            PromiseIpc.send("core.ready", undefined as any).then((eda) => {
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
                    <div style={{textAlign: 'center'}}>
                        <h1 style={{paddingTop: "50px"}}>
                            Loading
                        </h1>
                        <hr/>
                        <p style={{fontSize: "15px"}}>
                            {this.state.message}
                        </p>
                    </div>
                </Modal.Body>
            </Modal>
        </div>);
    }
}
export default StartUp;