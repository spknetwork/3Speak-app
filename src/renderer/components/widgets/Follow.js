import {FaBell} from "react-icons/fa/index";
import React, {Component} from "react";
import {Button} from "react-bootstrap";
import utils from '../../utils';
import RefLink from "../../../main/RefLink";

class Follow extends Component {
    constructor(props) {
        super(props)
        this.state = {
            followers: 0,
            reflink: RefLink.parse(props.reflink)
        }
    }

    async componentDidMount(reflink) {
        this.setState({
            followers: await utils.accounts.getFollowerCount(this.props.reflink)
        })
    }

    render() {
        return(<div>
            <Button variant="light" size="sm">
                <span>Follow </span>
                <strong>
                    <a href={`#/user/${this.state.reflink.root}/followers`} className="view-followers" title="Click to see followers">
                        {this.state.followers}
                    </a>
                </strong>
            </Button>

        </div>)
    }
}

export default Follow