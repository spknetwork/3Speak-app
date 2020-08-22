import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import axios from 'axios';
import LeaderTile from '../components/widgets/LeaderTile'

class Leaderboard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            first: null,
            second: null,
            third: null,
            bronze: []
        }
    }
    async componentDidMount() {
        let data = (await axios.get("https://3speak.online/apiv2/leaderboard")).data
        let state = {
            bronze: []
        }
        let step = 1;
        for (var ex of data) {
            if(step >= 30) {
                break;
            }
            if (step === 1) {
                state["first"] = ex;
            } else if (step === 2) {
                state["second"] = ex;
            } else if (step === 3) {
                state["third"] = ex;
            } else {
                state["bronze"].push(ex);
            }
            step++;
        }
        console.log(state)
        this.setState(state);
    }
    render() {
        return (<div>
            <Row className="justify-content-md-center">
                <div className="col-xl-8 col-sm-8 col-12 mb-3">
                    {this.state.first ? <LeaderTile info={this.state.first} reflink={`hive:${this.state.first.username}`}/> : null }
                </div>
            </Row>
            <Row className="justify-content-md-center">
                <div className="col-xl-5 col-sm-8 col-12 mb-3">
                    {this.state.second ? <LeaderTile info={this.state.second} reflink={`hive:${this.state.second.username}`}/> : null }
                </div>
                <div className="col-xl-5 col-sm-8 col-12 mb-3">
                    {this.state.third ? <LeaderTile info={this.state.third} reflink={`hive:${this.state.third.username}`}/> : null }
                </div>
                <Row>
                    {this.state.bronze.map(value => (
                        <div key={value.username} className="col-xl-2 col-sm-4 mb-3">
                            <LeaderTile info={value} reflink={`hive:${value.username}`}/>
                        </div>
                    ))}
                </Row>
            </Row>
        </div>);
    }
}

export default Leaderboard;