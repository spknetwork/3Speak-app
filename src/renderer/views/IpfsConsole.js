import React, { Component } from 'react';
import {Col, Row, Button, ButtonGroup, Table} from 'react-bootstrap'
import IpfsHandler from '../../main/core/components/ipfsHandler'
import Convert from 'convert-units';
import {NotificationManager} from 'react-notifications';

//JSON editor specific
import { JsonEditor as Editor } from 'jsoneditor-react';
import 'jsoneditor-react/es/editor.min.css';
import ace from 'brace';
import 'brace/mode/json';
import 'brace/theme/github';
import 'brace/theme/monokai';
import 'brace/theme/solarized_dark';
const {shell} = require('electron') // deconstructing assignment

class IpfsStatsLive extends Component {
    constructor(props) {
        super(props);
        this.state = { stats: {}, repo: {}, configError: false }
        this.editor = React.createRef();
        
        this.pid = null;
        this.update = this.update.bind(this)
    }
    componentDidMount() {
        this.pid = setInterval(this.update, 5000);
        this.update();
    }
    componentWillUnmount() {
        clearInterval(this.pid);
    }
    async update() {
        const {ipfs, ipfsPath} = await IpfsHandler.getIpfs()
        var out = {};
        for await (var e of ipfs.stats.bw()) {
            for(var key in e) {
                out[key] = Math.round(e[key].toNumber())
            }
        }
        var repo = await ipfs.stats.repo()
        repo.repoSize = repo.repoSize.toNumber();
        repo.path = ipfsPath;
        this.setState({
            stats: out,
            repo
        })
    }
    render() { 
        var table = [];
        /*for(var key in this.state.stats) {
            var val = out[key];
            table.push(<tr>
                <tr>
                   <strong>In</strong> 
                </tr>
                <tr>
                   <strong>Total</strong> 
                </tr>
            </tr>)
        }*/
        table.push(<tr key="Main">
            <td></td>
            <td>
               <strong>{Math.round(Convert(this.state.stats.rateIn).from("B").toBest().val) + " " + Convert(this.state.stats.rateIn).from("B").toBest().unit + " /s"}</strong> 
            </td>
            <td>
               <strong>{Math.round(Convert(this.state.stats.rateOut).from("B").toBest().val) + " " + Convert(this.state.stats.rateOut).from("B").toBest().unit + " /s"}</strong> 
            </td>
            <td>
               <strong>{Math.round(Convert(this.state.stats.totalIn).from("B").toBest().val) + " " + Convert(this.state.stats.totalIn).from("B").toBest().unit}</strong> 
            </td>
            <td>
               <strong>{Math.round(Convert(this.state.stats.totalOut).from("B").toBest().val) + " " + Convert(this.state.stats.totalOut).from("B").toBest().unit}</strong> 
            </td>
        </tr>)
        
        return (<Table responsive="sm">
            <thead>
                <tr>
                    <th>#</th>
                    <th>In</th>
                    <th>Out</th>
                    <th>Total In</th>
                    <th>Total Out</th>
                </tr>
            </thead>
            <tbody>
                {table}
            </tbody>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Repo Size</th>
                    <th>Repo Path</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th></th>
                    <th>{(Convert(this.state.repo.repoSize).from("B").toBest().val || 0).toFixed(2) + " " + Convert(this.state.repo.repoSize).from("B").toBest().unit}</th>
                    <th>
                        {this.state.repo.path} 
                        <Button style={{marginLeft: "5px"}} className="btn-sm" onClick={() => {shell.openItem(this.state.repo.path)}}>
                            Open
                        </Button>
                    </th>
                </tr>
            </tbody>
        </Table>);
    }
}

class IpfsDebug extends Component {
    constructor(props) {
        super(props);
        this.state = { ipfsConfig: {}, ipfsInfo: {} }
        this.editor = React.createRef();
        this.pid = null;
    }
    componentDidMount() {
        this.getIpfsConfig();
    }
    async getIpfsConfig() {
        const ipfsInfo = await IpfsHandler.getIpfs();
        this.setState({
            ipfsInfo
        })
        var jsonContent;
        var {ipfs} = ipfsInfo;
        this.editor.current.createEditor({
            value: await ipfs.config.getAll(), 
            ace:ace, 
            mode: "code", 
            theme:"ace/theme/solarized_dark",
            ref:this.editor,
            htmlElementProps: {
                style: {
                    height: "500px"
                }
            },
            onChange: (json) => {
                jsonContent = json;
            }
        })
        
        var configError;
        this.pid = setInterval(() => {
            const annotations = this.editor.current.jsonEditor.aceEditor.getSession().getAnnotations();
            configError = annotations.length === 0 ? false : true
            this.setState({
                configError
            })
        }, 150)
    }
    componentWillUnmount() {
        clearInterval(this.pid)
    }
    render() { 
        return ( <div style={{padding: "5px", overflow:"hidden"}}>
            <h3>
                This is the IPFS Debug Console. 
                This is for advanced users only, if you don't know what you are doing stay out of this area.
            </h3>
            <div style={{overflow:"show"}}>
                <Row>
                    <Col style={{background:"#f8f9fa", margin: "5px"}}>
                        <Editor
                            value={this.state.ipfsConfig}
                            ace={ace}
                            mode="code"
                            theme="ace/theme/solarized_dark"
                            ref={this.editor}
                            htmlElementProps={{style: {
                                height: "560px"
                            }}}
                            onChange={(json) => {
                                console.log(json)
                            }}
                        />
                        <ButtonGroup>
                            <Button variant="success" onClick={async() => {
                                try {
                                    var jsonContent = this.editor.current.jsonEditor.get();
                                    NotificationManager.success("IPFS config saved")
                                    await this.state.ipfsInfo.ipfs.config.replace(jsonContent)
                                } catch (ex){
                                    console.log(ex)
                                }
                            }} disabled={this.state.configError}>
                                Save
                            </Button>
                        </ButtonGroup>
                    </Col>
                    <Col style={{background:"#f8f9fa", margin: "5px"}}>
                        <IpfsStatsLive/>
                    </Col>
                </Row>
                <Row>
                    <Col style={{background:"#f8f9fa", margin: "5px"}}>
                    </Col>
                    <Col style={{background:"#f8f9fa", margin: "5px"}}>
                    </Col>
                </Row>
            </div>
        </div> );
    }
}
 
export default IpfsDebug;