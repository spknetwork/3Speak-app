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
            /*showModal: false*/
        }
    }

    componentDidMount() {
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

    /*handleClose() {
        this.setState({
            showModal: false
        })
    }
    handleShow() {
        this.setState({
            showModal: true
        })
    }*/

    render() {
        return (
            <>
                <span className="ml-2 p-0">
                    <span style={{cursor: "pointer"}}>
                        <FaThumbsUp className="text-secondary"/>
                    </span>
                    <span className='d-none'>
                        <RangeSlider value={this.state.upvotePct} onChange={changeEvent => this.setState({upvotePct: changeEvent.target.value})} />
                        <FontAwesomeIcon size={'lg'} icon={<FaChevronCircleUp style={{cursor: "pointer"}}/>} />
                        <FontAwesomeIcon size={'lg'} icon={<FaTimesCircle  style={{cursor: "pointer"}} className="text-danger"/>} />
                    </span>
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
                        <FaThumbsDown className="text-secondary"/>
                    </span>
                    <span className='d-none'>
                        <RangeSlider value={this.state.downvotePct} onChange={changeEvent => this.setState({downvotePct: changeEvent.target.value})} />
                        <FontAwesomeIcon size={'lg'} icon={<FaChevronCircleDown style={{cursor: "pointer"}}/>} />
                        <FontAwesomeIcon size={'lg'} icon={<FaTimesCircle  style={{cursor: "pointer"}} className="text-danger"/>} />
                    </span>
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