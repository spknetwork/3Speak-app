import React, { Component } from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap';

class CreatorStudio extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        const webview = document.getElementById('foo')
        const indicator = document.querySelector('.indicator')

        const loadstart = () => {
           indicator.innerText = 'loading...'
        }

        const loadstop = () => {
           indicator.innerText = ''
        }

        webview.addEventListener('did-start-loading', loadstart)
        webview.addEventListener('did-stop-loading', loadstop)
    }
    render() {
        return (
        <Container fluid>
            <Row>
                <webview id="foo" src="https://studio.3speak.co" style={{width: "100%", height: "600px"}}>
                    <div className="indicator"></div>
                </webview>
            </Row>
        </Container>);
    }
}
export default CreatorStudio;