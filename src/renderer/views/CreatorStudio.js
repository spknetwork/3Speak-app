import React, { Component } from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap';

class CreatorStudio extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    componentDidMount() {}
    render() {
        return (
        <Container fluid>
            <Row>
                <webview id="foo" src="https://studio.3speak.co" style={{width: "100%", height: "600px"}}></webview>
            </Row>
        </Container>);
    }
}
export default CreatorStudio;