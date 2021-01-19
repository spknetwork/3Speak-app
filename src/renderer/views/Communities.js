import React, { Component } from 'react';
import { Col, Container, Row, Button } from 'react-bootstrap';
import CommunityTile from '../components/widgets/CommunityTile'
const { Client: HiveClient } = require('@hiveio/dhive');
const client = new HiveClient('https://api.openhive.network');

class Communities extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        };
    }
    componentDidMount() {
        document.title = "3Speak - Tokenised video communities"
        this.generate();
    }
    async generate() {
        this.setState({
            data: await client.call("bridge", "list_communities", { last: "", limit: 100 })
        })
    }
    render() {
        return (<Container fluid>
            <Row>
                <div className="col-12">
                    <h3 style={{ display: "inline-block" }}>Communities</h3>
                    <span className="float-right mb-3">
                        <Button id="communityCreate" variant="primary" disabled>
                            Create +
                    </Button>
                    </span>
                </div>
            </Row>
            <Row>
                {
                    this.state.data.map(value => (
                        <CommunityTile key={value.name} reflink={`hive:${value.name}`} info={value} />
                    ))
                }
            </Row>
        </Container>);
    }
}
export default Communities;