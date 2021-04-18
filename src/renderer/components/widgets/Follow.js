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
        const profileID = localStorage.getItem('SNProfileID');

        if (profileID) {
            const profile = await utils.acctOps.getAccount(profileID);
            const accountType = 'hive'
            const username = profile.nickname // follower
            const author = RefLink.parse(this.props.reflink).root // person to follow
            const what = 'blog' // default value for a follow operation
            const wif = profile.keyring[0].private.key // posting key

            const followOp = {username, author, what, wif, accountType}

            await utils.acctOps.followHandler(followOp);
        }
        
    }

    async handleUnfollow() {
        const profileID = localStorage.getItem('SNProfileID');

        if (profileID) {
            const profile = await utils.acctOps.getAccount(profileID);
            const accountType = 'hive'
            const username = profile.nickname // follower
            const author = RefLink.parse(this.props.reflink).root // person to follow
            const what = '' // default value for a follow operation
            const wif = profile.keyring[0].private.key // posting key

            const followOp = {username, author, what, wif, accountType}

            await utils.acctOps.followHandler(followOp);
        } else {
            console.log('log in first')
        }
    }

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
            <Button variant="light" size="sm" onClick={() => {this.handleUnfollow()}}>
                <span>Unfollow</span>
            </Button>
        </div>)
    }
}

export default Follow