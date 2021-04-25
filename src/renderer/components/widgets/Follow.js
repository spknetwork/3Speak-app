import {FaBell} from "react-icons/fa/index";
import React, {Component} from "react";
import {Button} from "react-bootstrap";
import utils from '../../utils';
import RefLink from "../../../main/RefLink";
import {NotificationManager} from 'react-notifications'
import ArraySearch from 'arraysearch';
const Finder = ArraySearch.Finder;

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
            try {
                const profile = await utils.acctOps.getAccount(profileID);
                const accountType = 'hive'
                const username = profile.nickname // follower
                const author = RefLink.parse(this.props.reflink).root // person to follow
                const what = 'blog' // default value for a follow operation
                
                const theWifObj = Finder.one.in(profile.keyring).with({
                    privateKeys: { }
                })
                const wif = theWifObj.privateKeys.posting_key // posting key

                const followOp = {username, author, what, wif, accountType}

                await utils.acctOps.followHandler(followOp);
                NotificationManager.success('User followed, page will reload momentarily')
            } catch (error) {
                NotificationManager.success('There was an error completing this operation')
            }
            
        } else {
            NotificationManager.success('You need to be logged in to perform this operation')
        }
        
    }

    async handleUnfollow() {
        const profileID = localStorage.getItem('SNProfileID');

        if (profileID) {
            try {
                const profile = await utils.acctOps.getAccount(profileID);
                const accountType = 'hive'
                const username = profile.nickname // follower
                const author = RefLink.parse(this.props.reflink).root // person to follow
                const what = '' // default value for a follow operation
                
                const theWifObj = Finder.one.in(profile.keyring).with({
                    privateKeys: { }
                })
                const wif = theWifObj.privateKeys.posting_key // posting key
    
                const followOp = {username, author, what, wif, accountType}
    
                await utils.acctOps.followHandler(followOp);
                NotificationManager.success('User unfollowed, page will reload momentarily')
                
            } catch (error) {
                NotificationManager.success('You need to be logged in to perform this operation')
                
            }
        } else {
            NotificationManager.success('You need to be logged in to perform this operation')
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