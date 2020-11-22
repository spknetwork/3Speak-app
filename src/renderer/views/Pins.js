import React, { Component, useState } from 'react';
import PromiseIpc from 'electron-promise-ipc';
import { Table, Button, Row, Col, Dropdown, FormControl, Form } from 'react-bootstrap';
import Convert from 'convert-units';
import { NotificationManager } from 'react-notifications';
import IpfsHandler from '../../main/core/components/ipfsHandler';
import Popup from 'react-popup';
import Utils from '../utils';
import CID from 'cids'
import RefLink from '../../main/RefLink'
import Debug from "debug";
const debug = Debug("blasio:pins")
const CustomToggle = React.forwardRef(({ children, onClick }, ref) => (
    <a
        href=""
        ref={ref}
        onClick={(e) => {
            e.preventDefault();
            onClick(e);
        }}
    >
        {children}
    </a>
));
// forwardRef again here!
// Dropdown needs access to the DOM of the Menu to measure it
const CustomMenu = React.forwardRef(
    ({ children, style, className, 'aria-labelledby': labeledBy }, ref) => {
        const [value, setValue] = useState('');

        return (
            <div
                ref={ref}
                style={style}
                className={className}
                aria-labelledby={labeledBy}
            >
                <FormControl
                    autoFocus
                    className="mx-3 my-2 w-auto"
                    placeholder="Type to filter..."
                    onChange={(e) => setValue(e.target.value)}
                    value={value}
                />
                <ul className="list-unstyled">
                    {React.Children.toArray(children).filter(
                        (child) =>
                            !value || child.props.children.toLowerCase().startsWith(value),
                    )}
                </ul>
            </div>
        );
    },
);
class Pins extends Component {
    constructor(props) {
        super(props);
        this.state = {
            pinls: [],
            newVideos: [],
            trendingVideos: []
        }
        this.pid = null;
        this.generate = this.generate.bind(this)
    }
    async componentDidMount() {
        await this.generate();
        this.pid = setInterval(this.generate, 1500)
        this.updateSearchTables()
    }
    updateSearchTables( community = null ) {
        let ids = this.state.pinls.map(x => {return x._id})
        console.log(ids)
        let newUrl = 'https://3speak.co/apiv2/feeds/new?limit=10'
        let trendingUrl = 'https://3speak.co/apiv2/feeds/trending?limit=10'
        if (community) {
            newUrl = `https://3speak.co/apiv2/feeds/community/${community}/new?limit=10`
            trendingUrl = `https://3speak.co/apiv2/feeds/community/${community}/trending?limit=10`
        }
        fetch(newUrl)
            .then(r => r.json())
            .then(r => {
                for (let video of r) {
                    let id = `hive:${video.author}:${video.permlink}`
                    video.isPinned = ids.includes(id);
                    video.id = id;
                }
                console.log(r)
                this.setState({newVideos: r})
            })
        fetch(trendingUrl)
            .then(r => r.json())
            .then(r => {
                for (let video of r) {
                    let id = `hive:${video.author}:${video.permlink}`;
                    video.isPinned = ids.includes(id);
                    video.id = id;
                }
                this.setState({trendingVideos: r})
            })
    }
    componentWillUnmount() {
        clearInterval(this.pid)
    }
    async generate() {
        var pinls = await PromiseIpc.send("pins.ls")
        this.setState({
            pinls
        })
    }
    async PinLocally(cids, title, _id) {
        debug(`CIDs to store ${JSON.stringify(cids)}`)
        if(cids.length !== 0) {
            NotificationManager.info("Pinning in progress")
            await PromiseIpc.send("pins.add", {
                _id,
                source: "Pins page",
                cids,
                expire: null,
                meta: {
                    title
                }
            })
            NotificationManager.success(`Video with reflink of ${this.state.reflink} has been successfully pinned! Thank you for contributing!`, "Pin Successful")
        } else {
            NotificationManager.warning("This video is not available on IPFS")
        }
        await this.generate()
    }
    async ManualAdd() {

    }
    async ManualGC() {

    }
    async actionSelect(key) {
        console.log(key)
        switch (key) {
            case "1": {
                var func = () => new Promise(async (resolve, reject) => {
                    var ref = React.createRef();
                    Popup.create({
                        content: <div>
                            <Form ref={ref}>
                                <Form.Label>
                                    Reflink
                                </Form.Label>
                                <FormControl name="reflink" placeholder="hive:username:123permlink">

                                </FormControl>
                            </Form>
                        </div>,
                        buttons: {
                            left: [{
                                text: 'Cancel',
                                className: 'secondary',
                                action: function () {
                                    Popup.close();
                                }
                            }],
                            right: [{
                                text: 'Done',
                                className: 'success',
                                action: function () {
                                    resolve(Utils.formToObj(new FormData(ref.current)))
                                    Popup.close();
                                }
                            }]
                        }
                    });
                })
                var ret = await func();
                var video_info = (await Utils.accounts.permalinkToVideoInfo(ret.reflink))
                let cids = [];
                for (const source of video_info.sources) {
                    const url = new (require('url').URL)(source.url)
                    try {
                        new CID(url.host)
                        cids.push(url.host)
                    } catch (ex) {
                        console.log(ex)
                    }
                }
                if (cids.length !== 0) {
                    NotificationManager.info("Pinning in progress")
                    await PromiseIpc.send("pins.add", {
                        _id: ret.reflink,
                        source: "Manual Add",
                        cids,
                        expire: null,
                        meta: {
                            title: video_info.title
                        }
                    })
                    NotificationManager.success(`Video with reflink of ${ret.reflink} has been successfully pinned! Thank you for contributing!`, "Pin Successful")
                } else {
                    NotificationManager.warning("This video is not available on IPFS")
                }
                break;
            }
            case "2": {
                NotificationManager.info("GC has started");
                var { ipfs } = await IpfsHandler.getIpfs();
                ipfs.repo.gc()
                break;
            }
            default: {

            }
        }
    }
    async removePin(reflink) {
        try {
            await PromiseIpc.send("pins.rm", reflink)
            NotificationManager.success("IPFS pin removal complete")
            await this.generate();
        } catch (ex) {
            NotificationManager.error("IPFS pin removal resulted in error")
            console.log(ex)
        }
    }
    render() {
        let rows = [];
        for (const pin of this.state.pinls) {
            //Create human friendly siez string
            var sizeBest = Math.round(Convert(pin.size).from("B").toBest().val) + Convert(pin.size).from("B").toBest().unit
            rows.push(<tr key={pin._id}>
                <td>
                    <a href={`#/watch/${pin._id}`}>{pin._id}</a>
                    <br />
                    (<strong>{RefLink.parse(pin._id).root}</strong>)
                </td>
                <td>
                    {pin.meta ? pin.meta.title : null}
                </td>
                <td>
                    {pin.cids.length > 1 ? <a>View ({pin.cids.length})</a> : pin.cids}
                </td>
                <td>
                    {pin.source}
                </td>
                <td>
                    {pin.expire ? (() => {
                        console.log(pin.expire)
                        return "In " + Math.round(Convert(pin.expire - (new Date() / 1)).from("ms").toBest().val) + Convert(pin.expire - (new Date() / 1)).from("ms").toBest().unit
                    })() : "Permanent"}
                </td>
                <td>
                    {pin.size === 0 ? <strong>Pinning In Progress</strong> : sizeBest}
                </td>
                <td>
                    <Button variant="danger" onClick={() => this.removePin(pin._id)}>
                        X
                    </Button>
                </td>
            </tr>);
        }
        return (<div>
            <Row>
                <Col style={{ textAlign: "right" }}>
                    <Dropdown onSelect={this.actionSelect}>
                        <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
                            <Button>
                                Actions</Button>
                        </Dropdown.Toggle>

                        <Dropdown.Menu as={CustomMenu}>
                            <Dropdown.Item eventKey="1">Manual Pin</Dropdown.Item>
                            <Dropdown.Item eventKey="2">Manual GC</Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </Col>
            </Row>
            <Table striped bordered hover size="sm">
                <thead>
                    <tr>
                        <th>Reflink</th>
                        <th>Title</th>
                        <th>CID(s)</th>
                        <th>Source</th>
                        <th>Expiration</th>
                        <th>Size/Status</th>
                        <th>Remove?</th>
                    </tr>
                </thead>
                <tbody>
                    {rows}
                </tbody>
            </Table>
            <h6>Select to pin and help secure the network by backing up videos</h6>
            <input type='text' placeholder='Enter community ID...' onChange={(event) => {
                if (event.target.value.match(/\bhive-\d{6}\b/g)) {
                    this.updateSearchTables(event.target.value)
                }
            }} />
            <Row>
                {['new', 'trending'].map(type => (
                    <Col>
                        <Table striped bordered hover size='sm'>
                            <thead>
                            <tr>
                                <th>{type} videos</th>
                                <th>Title</th>
                                <th>Creator</th>
                                <th>pinned</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state[`${type}Videos`].map(video => (
                                <tr>
                                    <td><img src={video.images.thumbnail} /></td>
                                    <td>{video.title}</td>
                                    <td>{video.author}</td>
                                    <td>{video.isPinned ? (
                                        <Button variant="danger" onClick={async() => {
                                            await this.removePin(video.id)
                                            this.updateSearchTables()
                                        }}>X</Button>
                                    ) : (
                                        <button variant="success" onClick={async() => {
                                            await this.PinLocally([video.ipfs], video.title, video.id)
                                            this.updateSearchTables()
                                        }}>O</button>
                                    )}</td>
                                </tr>
                            ))}
                            </tbody>
                        </Table>
                    </Col>
                ))}

            </Row>
        </div>);
    }
}

export default Pins;