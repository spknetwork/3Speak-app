import {FaBell} from "react-icons/fa/index";
import React, {Component} from "react";
import {Button} from "react-bootstrap";

class Follow extends Component {
    constructor() {
        super()
        this.state = {followers: 0}
    }

    componentDidMount() {
        fetch('https://api.openhive.network', {
            method: 'POST',
            /*headers: {'Content-Type': 'application/json'},*/
            body: JSON.stringify({
                jsonrpc:"2.0",
                method:"follow_api.get_follow_count",
                params:{"account":this.props.user},
                id:1
            })
        })
            .then(res =>res.json())
            .then(json => {
                this.setState({
                    followers: json.result.follower_count
                })
            })
    }

    render() {
        return(<div>
            <Button variant="light" size="sm">
                <span>Follow </span>
            <strong>
                <a href={`#/user/${this.props.user}/followers`} className="view-followers" title="Click to see followers">
                    {this.state.followers}
                </a>
            </strong>
            </Button>

        </div>)
    }
}

export default Follow