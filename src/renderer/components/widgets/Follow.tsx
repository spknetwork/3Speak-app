import {FaBell} from "react-icons/fa/index";
import React, {Component} from "react";
import {Button} from "react-bootstrap";
import utils from '../../utils';
import RefLink from "../../../main/RefLink";
import {NotificationManager} from 'react-notifications'
import ArraySearch from 'arraysearch';
const Finder = ArraySearch.Finder;

class Follow extends Component<any,any> {
    constructor(props) {
        super(props)
        this.state = {
            followers: 0,
            reflink: RefLink.parse(props.reflink),
            alreadyFollowing: null
        }
    }

    async componentDidMount() {
        this.loadFollowers();
        this.loadAlreadyFollowing()
    }
    async loadAlreadyFollowing() {
        var out = await utils.acctOps.getFollowing()
        const whoFollow = RefLink.parse(this.props.reflink).root
        
        let alreadyFollowing = false;
        for(var ln of Object.values(out)) {
            if(whoFollow === ln.following) {
                alreadyFollowing = true;
                break;
            }
        }
        console.log(alreadyFollowing)
        this.setState({
            alreadyFollowing
        })
    }
    async loadFollowers() {
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
                const author = RefLink.parse(this.props.reflink).root // person to follow
                console.log(profile)
                
                const what = "blog"
                const followOp = {author, accountType, what}
                await utils.acctOps.followHandler(profileID, followOp);
                NotificationManager.success('User followed')
                this.setState({
                    alreadyFollowing: true
                })
            } catch (error) {
                console.log(error)
                NotificationManager.error('There was an error completing this operation')
            }
            
        } else {
            NotificationManager.error('You need to be logged in to perform this operation')
        }
    }
    async handleUnfollow() {
        const profileID = localStorage.getItem('SNProfileID');

        if (profileID) {
            try {
                const profile = await utils.acctOps.getAccount(profileID);
                const accountType = 'hive'
                const author = RefLink.parse(this.props.reflink).root // person to follow
                console.log(profile)
                
                const what = null
                const followOp = {author, accountType, what}
                await utils.acctOps.followHandler(profileID, followOp);
                NotificationManager.success('User unfollowed')
            } catch (error) {
                console.log(error)
                NotificationManager.error('There was an error completing this operation')
            }
            this.setState({
                alreadyFollowing: false
            })
        } else {
            NotificationManager.error('You need to be logged in to perform this operation')
        }
    }

    render() {
        return(<div>
            {this.state.alreadyFollowing ? <Button variant="light" size="sm" onClick={() => {this.handleUnfollow()}}>
                <span>Unfollow</span>
            </Button> :
            <Button variant="light" size="sm" onClick={() => {this.handleFollow()}}>
                <span>Follow</span>
                <strong>
                    <a href={`#/user/${this.state.reflink.root}/followers`} className="view-followers" title="Click to see followers">
                        {this.state.followers}
                    </a>
                </strong>
            </Button> }
            
        </div>)
    }
}

export default Follow