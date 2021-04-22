import {FaChevronCircleUp, FaThumbsDown, FaThumbsUp, FaTimesCircle, FaChevronCircleDown} from "react-icons/fa";
import React from "react";
import RangeSlider from 'react-bootstrap-range-slider';
import {/*Modal, Button,*/ OverlayTrigger, Popover} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Utils from "../../utils";
import RefLink from "../../../main/RefLink";

class Vote extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            author: RefLink.parse(props.reflink).root,
            permlink: RefLink.parse(props.reflink).permlink,
            downvoters: [],
            upvoters: [],
            upvotePct: 0,
            downvotePct: 0,
            showModal: false,
            showDModal: false
        }
    }

    componentDidMount() {
       this.setVoters()
    }
    setVoters() {
        Utils.accounts.permalinkToPostInfo(this.props.reflink).then(post => {
            let votes = post.active_votes.sort((e,i) => {
                return i.rshares - e.rshares
            });
            this.setState({
                downvoters: votes.filter(vote => vote.percent < 0),
                upvoters: votes.filter(vote => vote.percent >= 0).reverse()
            })
        })
    }
    handleClose() {
        this.setState({
            showModal: false
        })
    }
    handleShow() {
        this.setState({
            showModal: true
        })
    }
    handleDClose() {
        this.setState({
            showDModal: false
        })
    }
    handleDShow() {
        this.setState({
            showDModal: true
        })
    }
    async searchWif(arr){
        let wif
        await arr.find(function(obj) {
            wif = obj.privateKeys.posting_key
        })
        return wif
    }
    async handleVote() {
        const modalState = this.state.showModal;
        if (modalState === false) {
            this.handleShow()
        } else {
            const profileID = localStorage.getItem('SNProfileID');

            if (profileID) {
                const profile = await Utils.acctOps.getAccount(profileID);
                const wif = await this.searchWif(profile.keyring); // posting key
                const voter = profile.nickname // voting account
                const author = this.state.author // account being rewarded
                const permlink = this.state.permlink // post permlink to vote
                const weight = this.state.upvotePct; // vote weight in percentage(between 1 - 100)
                const accountType = 'hive'
    
                const voteOp = {wif, voter, author, permlink, weight, accountType, profileID}
    
                const votePost = await Utils.acctOps.voteHandler(voteOp);
            } else {
                alert('log in first')
            }
        }
    }

    async handleDownVote() {
        const modalState = this.state.showDModal;
        if (modalState === false) {
            this.handleDShow()
        } else {
            const profileID = localStorage.getItem('SNProfileID');

            if (profileID) {
                const profile = await Utils.acctOps.getAccount(profileID);
                const wif = await this.searchWif(profile.keyring);; // posting key
                const voter = profile.nickname // voting account
                const author = this.state.author // account being rewarded
                const permlink = this.state.permlink // post permlink to vote
                const weight = this.state.downvotePct * -1; // vote weight in percentage(between 1 - 100)
                const accountType = 'hive'
    
                const voteOp = {wif, voter, author, permlink, weight, accountType, profileID}
    
                const votePost = await Utils.acctOps.voteHandler(voteOp);
            } else {
                alert('log in first')
            }
        }
    }

    render() {
        return (
            <>
                <span className="ml-2 p-0">
                    <span style={{cursor: "pointer"}}>
                        <FaThumbsUp className="text-secondary" onClick={() => {this.handleVote()}}/>
                    </span>
                    {(this.state.showModal) && (<span>
                        <RangeSlider value={this.state.upvotePct} onChange={changeEvent => this.setState({upvotePct: changeEvent.target.value})} />
                        <FontAwesomeIcon size={'lg'} icon={<FaChevronCircleUp style={{cursor: "pointer"}}/>} />
                        <FontAwesomeIcon size={'lg'} icon={<FaTimesCircle  style={{cursor: "pointer"}} className="text-danger"/>} />
                    </span>)}
                </span>
                <OverlayTrigger rootClose trigger="click" placement="bottom" overlay={
                    <Popover>
                        <Popover.Title as="h3">
                            Upvotes for @{this.state.author}/{this.state.permlink}
                        </Popover.Title>
                        <Popover.Content>
                            {this.state.upvoters.slice(0,10).map(e => {return <>@{e.voter}: {e.percent/100}%<br/></>})}
                            <a onClick={() => {
                                //todo: open modal
                            }}>See more...</a>
                        </Popover.Content>
                    </Popover>}>
                    <b style={{cursor: "pointer"}}>{this.state.upvoters.length}</b>
                </OverlayTrigger>

                <span className="ml-2 p-0">
                    <span style={{cursor: "pointer"}}>
                        <FaThumbsDown className="text-secondary" onClick={() => {this.handleDownVote()}}/>
                    </span>
                    {(this.state.showDModal) && (<span>
                        <RangeSlider value={this.state.downvotePct} onChange={changeEvent => this.setState({downvotePct: changeEvent.target.value})} />
                        <FontAwesomeIcon size={'lg'} icon={<FaChevronCircleDown style={{cursor: "pointer"}}/>} />
                        <FontAwesomeIcon size={'lg'} icon={<FaTimesCircle  style={{cursor: "pointer"}} className="text-danger"/>} />
                    </span>)}
                </span>
                <OverlayTrigger rootClose trigger="click" placement="bottom" overlay={
                    <Popover>
                        <Popover.Title as="h3">
                            Downvotes for @{this.state.author}/{this.state.permlink}
                        </Popover.Title>
                        <Popover.Content>
                            {this.state.downvoters.slice(0,10).map(e => {return <>@{e.voter}: {e.percent/100}%<br/></>})}
                            <a onClick={() => {
                                //todo: open modal
                            }}>See more...</a>
                        </Popover.Content>
                    </Popover>}>
                    <b style={{cursor: "pointer"}}>{this.state.downvoters.length}</b>
                </OverlayTrigger>

                {/*<Modal show={this.state.showModal} onHide={this.handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Modal heading</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{this.state.upvoters}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleClose}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>*/}
            </>
        )
    }
}

export default Vote