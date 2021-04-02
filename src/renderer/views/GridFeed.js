import React from 'react';
import VideoWidget from "../components/video/VideoWidget";
import RefLink from "../../main/RefLink";
import PromiseIpc from 'electron-promise-ipc';
import { Container } from 'react-bootstrap'
import Pushable from 'it-pushable'
import Knex from 'knex'
import Consts from '../../consts'
const knex = Knex({
    client: 'mssql',
    connection: {
        host: 'vip.hivesql.io',
        user: Consts.hivesql_username,
        password: Consts.hivesql_password,
        database: 'DBHive'
    },
    pool: {
        max: 7,
        min: 3
    }
});

const hiveSQLQuery = (() => {
    var stream = Pushable();
    var run = async () => {
        //await hivesql;
        //const request = new mysql.Request();
        //request.stream = true;
        var request = hivesql.query(`SELECT x.* FROM DBHive.dbo.Comments x
        WHERE CONTAINS(json_metadata , '3speak/video') AND created  >= DATEADD(day,-6,GETDATE())`)

        let rowsToProcess = [];
        request.on('fields', row => {
            console.log(row)
            row.json_metadata = JSON.parse(row.json_metadata)
            stream.push(row)

            if (rowsToProcess.length >= 15) {
                //request.pause();
            }
        });
        request.on('done', () => {
            stream.end();
        });
    }
    run();
    return stream;
});
class GridFeed extends React.Component {
    constructor(props) {
        super(props);
        // pass awaitingMoreData as true to prevent lazy loading
        let { awaitingMoreData = undefined, source = "hive" } = props
        this.state = { data: [], awaitingMoreData, reflink: RefLink.parse(source), offset: 0 }
        this.handleScroll = this.handleScroll.bind(this);
    }
    componentDidUpdate(prevProps) {
        if (this.props.type !== prevProps.type || this.props.data !== prevProps.data) {
            if (this.props.data) {
                this.setState({
                    data: []
                })
            } else {
                this.setState({
                    data: []
                })
                // Handle path changes
                this.retrieveData();
            }
            window.scrollTo(0, 0)
        }
    }
    componentDidMount() {
        document.title = "3Speak - Tokenised video communities"
        if (this.props.data) {
            this.setState({
                data: this.props.data
            })
        } else {
            window.addEventListener("scroll", this.handleScroll);
            this.retrieveData();
        }
    }
    async retrieveData() {
        //For now use the 3speak.tv API until a proper solution is devised
        if (this.props.type === "home") {
            fetch(`https://3speak.tv/apiv2/feeds/${this.props.type}`)
                .then(res => res.json())
                .then(async json => {
                    for (var e in json) {
                        if (await PromiseIpc.send("blocklist.has", `hive:${json[e].author}:${json[e].permlink}`)) {
                            delete json[e];
                        }
                    }
                    console.log(json)
                    this.setState({ data: json })
                })
            return;
        }

        //var query = knex.raw("SELECT TOP 10 x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND created  >= DATEADD(day,-6,GETDATE()) ORDER BY ID DESC")
        let query;
        if (this.props.type === "new") {
            query = knex.raw("SELECT x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND created  >= DATEADD(day,-10,GETDATE()) ORDER BY ID DESC OFFSET 0 ROWS FETCH NEXT 25 ROWS ONLY")
            //query = knex.raw("SELECT x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND author IN ('theycallmedan', 'starkerz', 'priyanarc', 'blind-spot', 'hafizullah') ORDER BY ID DESC OFFSET 0 ROWS FETCH NEXT 25 ROWS ONLY")
        } else if (this.props.type === "trending") {
            console.log(this.props.type)
            query = knex.raw("SELECT x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND created  >= DATEADD(day,-10,GETDATE()) ORDER BY total_vote_weight DESC OFFSET 0 ROWS FETCH NEXT 25 ROWS ONLY")
        } else if (this.props.type[0] === "@") {
            var author = this.props.type.substring(1)
            console.log(author)
            query = knex.raw(`SELECT x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND author LIKE '${author}' ORDER BY ID DESC OFFSET 0 ROWS FETCH NEXT 25 ROWS ONLY`)
        } else if (this.props.type[0] === "#") {
            var catString = this.props.type.substring(1)
            var category = catString.split("/");
            query = knex.raw(`SELECT x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND category LIKE '${category[0]}' ORDER BY ${category[1] === "trending" ? "total_vote_weight" : "ID"} DESC OFFSET 0 ROWS FETCH NEXT 25 ROWS ONLY`)
        }

        query.on('query-response', (ret, det, aet) => {
            console.log(ret, det, aet)
        })
        var blob = [];
        query.stream().on('data', async (val) => {
            if (await PromiseIpc.send("blocklist.has", `hive:${val.author}:${val.permlink}`)) {
                console.log(`${val.author} is blocked`)
                return;
            }
            val.json_metadata = JSON.parse(val.json_metadata)
            //console.log(val)
            blob.push({
                created: val.created,
                author: val.author,
                permlink: val.permlink,
                tags: val.json_metadata.tags,
                title: val.title,
                duration: val.json_metadata.video.info.duration,
                "isIpfs": val.json_metadata.video.info.ipfs ? true : false,
                "ipfs": val.json_metadata.video.info.ipfs,
                "images": {
                    "ipfs_thumbnail": val.json_metadata.video.info.ipfsThumbnail ? `/ipfs/${val.json_metadata.video.info.ipfsThumbnail}` : null,
                    "thumbnail": `https://threespeakvideo.b-cdn.net/${val.permlink}/thumbnails/default.png`,
                    "poster": `https://threespeakvideo.b-cdn.net/${val.permlink}/poster.png`,
                    "post": `https://threespeakvideo.b-cdn.net/${val.permlink}/post.png`
                },
                views: val.total_vote_weight ? Math.log(val.total_vote_weight / 1000).toFixed(2) : 0
            })
            this.setState({ data: blob, offset: 25 })
        })
        query.then((rows) => {
            for (var val of rows) {
                val.json_metadata = JSON.parse(val.json_metadata)
                /*blob.push({
                    created: val.created,
                    author: val.author,
                    permlink: val.permlink,
                    tags: val.json_metadata.tags,
                    title: val.title,
                    duration: val.json_metadata.video.info.duration,
                    "isIpfs": val.json_metadata.video.info.ipfs ? true : false,
                    "ipfs": val.json_metadata.video.info.ipfs,
                    "images": {
                        "ipfs_thumbnail": val.json_metadata.video.info.ipfsThumbnail ? `/ipfs/${val.json_metadata.video.info.ipfsThumbnail}` : null,
                        "thumbnail": `https://threespeakvideo.b-cdn.net/${val.permlink}/thumbnails/default.png`,
                        "poster": `https://threespeakvideo.b-cdn.net/${val.permlink}/poster.png`,
                        "post": `https://threespeakvideo.b-cdn.net/${val.permlink}/post.png`
                    }
                })*/
            }
            console.log(rows, blob)
        }).catch((err) => { console.log(err); throw err })
            .finally(() => {

            });
        /*knex.from('DBHive.dbo.Comments').select("*").limit(10).where("CONTAINS(json_metadata , '3speak/video') ").orderBy("ID")
        .then((rows) => {
            console.log(rows)
            for (var row of rows) {
                
            }
        }).catch((err) => { console.log(err); throw err })
        .finally(() => {
            knex.destroy();
        });*/
        switch (this.state.reflink.source.value) {
            case "hive": {
                fetch(`https://3speak.tv/apiv2/feeds/${this.props.type}`)
                    .then(res => res.json())
                    .then(async json => {
                        for (var e in json) {
                            if (await PromiseIpc.send("blocklist.has", `hive:${json[e].author}:${json[e].permlink}`)) {
                                delete json[e];
                            }
                        }
                        //this.setState({ data: json })
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
                        //For now use the 3speak.tv API until a proper solution is devised
                        if (this.props.type === "home") {
                            fetch(`https://3speak.tv/api/${this.props.type === 'new' ? 'new' : 'trends'}/more?skip=${this.state.data.length}`)
                                .then(res => res.json())
                                .then(async json => {
                                    json = json.recommended ? json.recommended : json.trends
                                    json.forEach((video) => {
                                        video['author'] = video['owner'];
                                        delete video['owner'];
                                    });
                                    json = this.state.data.concat(json)
                                    json = json.filter((video, index, self) => {
                                        return index === self.findIndex((v) => {
                                            if (v) {
                                                return v.author === video.author && v.permlink === video.permlink
                                            }
                                        })
                                    })
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
                            return;
                        }
                        console.log(`Offset is ${this.state.data.length}`)
                        let query;
                        if (this.props.type === "new") {
                            query = knex.raw(`SELECT x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND created  >= DATEADD(day,-10,GETDATE()) ORDER BY ID DESC OFFSET ${this.state.offset} ROWS FETCH NEXT 25 ROWS ONLY`)
                        } else if (this.props.type === "trending") {
                            console.log(this.props.type)
                            query = knex.raw(`SELECT x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND created  >= DATEADD(day,-61,GETDATE()) ORDER BY total_vote_weight DESC OFFSET ${this.state.offset} ROWS FETCH NEXT 25 ROWS ONLY`)
                        } else if (this.props.type[0] === "@") {
                            var author = this.props.type.substring(1)
                            console.log(author)
                            query = knex.raw(`SELECT x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND author LIKE '${author}' ORDER BY ID DESC OFFSET ${this.state.offset} ROWS FETCH NEXT 25 ROWS ONLY`)
                        } else if (this.props.type[0] === "#") {
                            var catString = this.props.type.substring(1)
                            var category = catString.split("/");
                            query = knex.raw(`SELECT x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND category LIKE '${category[0]}' ORDER BY ${category[1] === "trending" ? "total_vote_weight" : "ID"} DESC OFFSET ${this.state.offset} ROWS FETCH NEXT 25 ROWS ONLY`)
                        }

                        query.on('query-response', (ret, det, aet) => {
                            console.log(ret, det, aet)
                        })
                        var blob = this.state.data;
                        var offset = this.state.offset;
                        query.stream().on('data', async (val) => {
                            if (await PromiseIpc.send("blocklist.has", `hive:${val.author}:${val.permlink}`)) {
                                console.log(`${val.author} is blocked`)
                                //return;
                            }
                            val.json_metadata = JSON.parse(val.json_metadata)
                            //console.log(val)
                            if (!(await PromiseIpc.send("blocklist.has", `hive:${val.author}:${val.permlink}`))) {
                                blob.push({
                                    created: val.created,
                                    author: val.author,
                                    permlink: val.permlink,
                                    tags: val.json_metadata.tags,
                                    title: val.title,
                                    duration: val.json_metadata.video.info.duration,
                                    "isIpfs": val.json_metadata.video.info.ipfs ? true : false,
                                    "ipfs": val.json_metadata.video.info.ipfs,
                                    "images": {
                                        "ipfs_thumbnail": val.json_metadata.video.info.ipfsThumbnail ? `/ipfs/${val.json_metadata.video.info.ipfsThumbnail}` : null,
                                        "thumbnail": `https://threespeakvideo.b-cdn.net/${val.permlink}/thumbnails/default.png`,
                                        "poster": `https://threespeakvideo.b-cdn.net/${val.permlink}/poster.png`,
                                        "post": `https://threespeakvideo.b-cdn.net/${val.permlink}/post.png`
                                    },
                                    views: val.total_vote_weight ? Math.log(val.total_vote_weight / 1000).toFixed(2) : 0
                                })
                            }
                            offset++;
                            console.log(`Next blob`)
                            this.setState({ data: blob, offset })

                        }).on('end', () => {
                            this.setState({
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