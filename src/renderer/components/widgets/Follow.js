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

    async handleFollow() {
        const accountType = 'hive'
        const username = 'gotgame' // follower
        const author = 'speak.bounties' // person to follow
        const what = "blog" // standard value for a follow operation
        const wif = '5Jbtw7B3tkFDUmtCg5ifBjFgDbE7MXuXKPsZ1E14wDFLH96marF' // posting key

        const followOp = {username, author, what, wif, accountType}

        const followUser = await utils.acctOps.followHandler(followOp);

        console.log(followUser)
    }

    async handleUnfollow() {}

    render() {
        return(<div>
            <Button variant="light" size="sm" onClick={() => {this.handleFollow()}}>
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