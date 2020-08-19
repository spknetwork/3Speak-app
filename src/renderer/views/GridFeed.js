import React from 'react';
import VideoWidget from "../components/video/VideoWidget";
import RefLink from "../../main/RefLink";

class GridFeed extends React.Component {
    constructor(props) {
        super(props);
        // pass awaitingMoreData as true to prevent lazy loading
        let {awaitingMoreData = undefined, source = "hive"} = props
        this.state = { data: [], awaitingMoreData, reflink: RefLink.parse(source)}
        this.handleScroll = this.handleScroll.bind(this);
    }

    componentDidMount() {
        window.addEventListener("scroll", this.handleScroll);
        switch(this.state.reflink.source.value) {
            case "hive": {
                fetch(`https://3speak.online/apiv2/feeds/${this.props.type}`)
                    .then(res => res.json())
                    .then(json => {
                        this.setState({data: json})
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
                switch(this.state.reflink.source.value) {
                    case "hive": {
                        fetch(`https://3speak.online/api/${this.props.type === 'new' ? 'new' : 'trends'}/more?skip=${this.state.data.length}`)
                            .then(res => res.json())
                            .then(json => {
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
                <h1>{this.props.type} videos</h1>
                <div className={'row'}>
                {this.state.data.map(el => (
                    <VideoWidget key={el.author + '/' + el.permlink} reflink={`hive:${el.author}:${el.permlink}`} {...el} />
                ))}
                </div>
            </div>
        );
    }
}

export default GridFeed