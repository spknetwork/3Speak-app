import React from 'react';
import VideoWidget from "../components/video/VideoWidget";
import RefLink from "../../main/RefLink";
import PromiseIpc from 'electron-promise-ipc';
import { Container } from 'react-bootstrap'

class GridFeed extends React.Component {
    constructor(props) {
        super(props);
        // pass awaitingMoreData as true to prevent lazy loading
        let { awaitingMoreData = undefined, source = "hive" } = props
        this.state = { data: [], awaitingMoreData, reflink: RefLink.parse(source) }
        this.handleScroll = this.handleScroll.bind(this);
    }
    componentDidUpdate(prevProps) {
        if (this.props.type !== prevProps.type || this.props.data !== prevProps.data) {
            if (this.props.data) {
                this.setState({
                    data: this.props.data
                }) 
            } else {
            // Handle path changes
                this.retrieveData();
            }
            window.scrollTo(0, 0)
        }
    }
    componentDidMount() {
        if (this.props.data) {
            this.setState({
                data: this.props.data
            })
        } else {
            window.addEventListener("scroll", this.handleScroll);
            this.retrieveData();
        }
    }
    retrieveData() {
        switch (this.state.reflink.source.value) {
            case "hive": {
                fetch(`https://3speak.co/apiv2/feeds/${this.props.type}`)
                    .then(res => res.json())
                    .then(async json => {
                        for (var e in json) {
                            if (await PromiseIpc.send("blocklist.has", `hive:${json[e].author}:${json[e].permlink}`)) {
                                delete json[e];
                            }
                        }
                        this.setState({ data: json })
                    })
            }
            case "orbitdb": {

            }
            default: {

            }
        }
    }
    componentWillUnmount() {
        window.removeEventListener("scroll", this.handleScroll);
    }

    handleScroll() {
        if (!this.state.awaitingMoreData) {
            const windowHeight = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
            const body = document.body;
            const html = document.documentElement;
            const docHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
            const windowBottom = windowHeight + window.pageYOffset;
            if (windowBottom + 200 >= docHeight) {
                this.setState({
                    awaitingMoreData: true
                });
                switch (this.state.reflink.source.value) {
                    case "hive": {
                        fetch(`https://3speak.co/api/${this.props.type === 'new' ? 'new' : 'trends'}/more?skip=${this.state.data.length}`)
                            .then(res => res.json())
                            .then(async json => {
                                json = json.recommended ? json.recommended : json.trends
                                json.forEach((video) => {
                                    video['author'] = video['owner'];
                                    delete video['owner'];
                                });
                                json = this.state.data.concat(json)
                                json = json.filter((video, index, self) =>
                                    index === self.findIndex((v) => (
                                        v.author === video.author && v.permlink === video.permlink
                                    ))
                                )
                                for (var e in json) {
                                    if (await PromiseIpc.send("blocklist.has", `hive:${json[e].author}:${json[e].permlink}`)) {
                                        delete json[e];
                                    }
                                }
                                this.setState({
                                    data: json,
                                    awaitingMoreData: false
                                })
                            })
                    }
                    case "orbitdb": {

                    }
                    default: {

                    }
                }

            }
        }
    }

    render() {
        return (
            <div>
                {
                    this.props.titleText !== undefined ? <div className="header_sec">
                        <Container fluid className="header_sec">
                            <div className="row">
                                <div className="col-lg-6 col-md-6 col-xs-12 header_dist1">
                                    <h1 className="white_col">{this.props.titleText}</h1>
                                </div>
                            </div>
                        </Container>
                    </div> : null
                }
                <section className="content_home">
                    <div className={'row'}>
                        {this.state.data.map(el => (
                            <VideoWidget key={el.author + '/' + el.permlink} reflink={`hive:${el.author}:${el.permlink}`} {...el} />
                        ))}
                    </div>
                </section>
            </div>
        );
    }
}

export default GridFeed