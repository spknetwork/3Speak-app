import PromiseIPC from 'electron-promise-ipc';
import axios from 'axios';
import ArraySearch from 'arraysearch';
import RefLink from '../main/RefLink';
import ipfsHandler from '../main/core/components/ipfsHandler'
import CID from 'cids'
import IpfsUtils from 'ipfs-core/src/utils'
import DHive, { Client, PrivateKey } from "@hiveio/dhive";
import { promisify } from 'util';
import DefaultThumbnail from './assets/img/default-thumbnail.jpg';
const Finder = ArraySearch.Finder;
const hive = require('@hiveio/hive-js');

const hiveClient = new Client(["https://api.hive.blog", "https://api.hivekings.com", "https://anyx.io", "https://api.openhive.network"]);


hive.broadcast.comment = promisify(hive.broadcast.comment)


const ipfs = {
    gateway: "https://ipfs.3speak.tv/ipfs/",
    async getGateway(cid, bypass) {
        if(bypass === true) {
            return ipfs.gateway;
        }
        var {ipfs:ipfsInstance} = await ipfsHandler.getIpfs();
        var has = false;
        try {
            for await(var pin of ipfsInstance.pin.ls({path: cid, type:"recursive"})) {
                if(pin.cid.equals(new CID(cid))) {
                    has = true;
                    break;
                }
            }
        } catch (ex) {
            console.log(ex)
        }
        if(has) {
            return "http://localhost:8080/ipfs/"
        } else {
            return ipfs.gateway;
        }
    },
    urlToIpfsPath(url) {
        url = new URL(url);
        if (url.protocol === "ipfs:" && url.pathname !== "") {
            return url.pathname;
        } else {
            return IpfsUtils.normalizeCidPath(url);
        }
    },
    urlToCID(url) {
        url = new (require('url')).URL(url)
        if (url.protocol === "ipfs:" && url.pathname !== "") {
            return url.hostname;
        } else {
            var ipfsPath = IpfsUtils.normalizeCidPath(url).split("/");
            return ipfsPath[0]
        }
    }
}
const accounts = {
    async convertLight(val) {
        if(typeof val.json_metadata === "object") {
            val.json_metadata = JSON.parse(val.json_metadata)
        }
        //console.log(val)
        if(!val.json_metadata.video) {
            val.json_metadata.video = {
                info: {}
            }
        }
	// ERROR: blob and thumbnail are not declared anywhere?
	/*
        blob.push({
            reflink: `hive:${val.author}:${val.permlink}`,
            created: val.created,
            author: val.author,
            permlink: val.permlink,
            tags: val.json_metadata.tags,
            title: val.title,
            duration: val.json_metadata.video.info.duration || val.json_metadata.video.duration,
            "isIpfs": val.json_metadata.video.info.ipfs || thumbnail ? true : false,
            "ipfs": val.json_metadata.video.info.ipfs,
            "images": {
                "ipfs_thumbnail":  thumbnail ?  `/ipfs/${thumbnail.slice(7)}` : `/ipfs/${val.json_metadata.video.info.ipfsThumbnail}` ,
                "thumbnail": `https://threespeakvideo.b-cdn.net/${val.permlink}/thumbnails/default.png`,
                "poster": `https://threespeakvideo.b-cdn.net/${val.permlink}/poster.png`,
                "post": `https://threespeakvideo.b-cdn.net/${val.permlink}/post.png`
            },
            views: val.total_vote_weight ? Math.log(val.total_vote_weight / 1000).toFixed(2) : 0
        })
	*/
    },
    /**
     * Retrieves post information from reflink.
     * @param {String|RefLink} reflink
     */
    async permalinkToPostInfo(reflink) {
        if(!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink)
        }
        const post_content = (await PromiseIPC.send("distiller.getContent", reflink.toString()) as any).json_content;
        return post_content;
    },
    /**
     * Retrieves post information as videoInfo from reflink.
     * @param {String|RefLink} reflink
     */
    async permalinkToVideoInfo(reflink, options: any = {}) {
        if(!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink)
        }
        if(!options.type) {
            options.type == "*"
        }
        var post_content = (await PromiseIPC.send("distiller.getContent", reflink.toString()) as any).json_content
        if(!post_content) {
            throw new Error("Invalid post content. Empty record");
        }
        switch (reflink.source.value) {
            case "hive": {
                console.log(post_content.json_metadata)
                const json_metadata = post_content.json_metadata;
                if(!(json_metadata.app && options.type === "video")) {
                    if(json_metadata.type) {
                        if(!json_metadata.type.includes("3speak/video")) {
                            throw new Error("Invalid post content. Not a video");
                        }
                    }
                    //throw new Error("Invalid post content. Not a video");
                }
                let sources = [];
                let title;
                let description;
                let duration;
                if(json_metadata.sourceMap) {
                    sources.push(...json_metadata.sourceMap)
                    return {
                        sources,
                        creation: new Date(post_content.created + "Z").toISOString(),
                        title: post_content.title,
                        description: post_content.body,
                        tags: json_metadata.tags,
                        refs: [`hive:${post_content.author}:${post_content.permlink}`], //Reserved for future use when multi account system support is added.
                        meta: {
                            duration:json_metadata.duration
                        }, //Reserved for future use.
                        reflink: `hive:${post_content.author}:${post_content.permlink}`
                    }
                }
                try {
                    const video_info = json_metadata.video.info;
                    const video_content = json_metadata.video.content;
                    description = video_content.description;
                    title = video_info.title
                    duration = video_info.duration

                    let urls = [];
                    if (video_info.ipfs != null && video_info.ipfs) {
                        urls.push(`ipfs://${video_info.ipfs}`)
                    }
                    if (video_info.ipfsThumbnail != null && video_info.ipfsThumbnail) {
                        sources.push({
                            type: "thumbnail",
                            url: `ipfs://${video_info.ipfsThumbnail}`
                        })
                    }
                    urls.push(`https://threespeakvideo.b-cdn.net/${reflink.permlink}/default.m3u8`)
                    if (video_info.file) {
                        urls.push(`https://threespeakvideo.b-cdn.net/${reflink.permlink}/${video_info.file}`)
                    }

                    for (let url of urls) {
                        sources.push({
                            type: "video",
                            url,
                            /**
                             * Reserved if a different player must be used on per format basis.
                             *
                             * If multi-resolution support is added in the future continue to use the url/format scheme.
                             * url should link to neccessary metadata.
                             */
                            format: url.split(".").slice(-1)[0]
                        })
                    }

                    sources.push({
                        type: "thumbnail",
                        url: `https://threespeakvideo.b-cdn.net/${reflink.permlink}/thumbnails/default.png`
                    })
                } catch (ex) {
                    title = post_content.title;
                    description = post_content.body
                }
                return {
                    sources,
                    creation: new Date(post_content.created + "Z").toISOString(),
                    title,
                    description,
                    tags: json_metadata.tags,
                    refs: [`hive:${post_content.author}:${post_content.permlink}`], //Reserved for future use when multi account system support is added.
                    meta: {duration}, //Reserved for future use.
                    reflink: `hive:${post_content.author}:${post_content.permlink}`
                }
            }
            default: {
                throw new Error("Unknown account provider")
            }
        }
    },
    async getProfileBackgroundImage(reflink) {
        if(!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink);
        }
        switch ("hive") {
            case "hive": {
                var json_content = (await PromiseIPC.send("distiller.getAccount", reflink.toString()) as any).json_content
                if(!json_content) {
                    throw new Error("Invalid account data content. Empty record");
                }
                json_content.posting_json_metadata = JSON.parse(json_content.posting_json_metadata)
                return json_content.posting_json_metadata.profile.cover_image;
            }
	    // Unreachable code
            //     case "orbitdb": {
            //         //Retrieve IPFS profile picture CID.
            //     }
            default: {
                throw new Error("Unknown account provider")
            }
        }
    },
    /**
     * Retrieves Account profile picture URL.
     * @todo Future item: Pull image from URL, then store locally for later use.
     * @param {String|RefLink} reflink
     */
    async getProfilePictureURL(reflink) {
        if(!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink);
        }
        switch ("hive") {
            case "hive": {
                var avatar_url = `https://images.hive.blog/u/${reflink.root}/avatar`;
                try {
                    await axios.head(avatar_url);
                    return avatar_url;
                } catch {
                    throw new Error("Failed to retrieve profile picture information")
                }
            }
	    // Unreachabe code
            //     case "orbitdb": {
            //         //Retrieve IPFS profile picture CID.
            //     }
            default: {
                throw new Error("Unknown account provider")
            }
        }
    },
    /**
     * Retrieves Follower count.
     * @param {String|RefLink} reflink
     */
    async getFollowerCount(reflink) {
        if(!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink)
        }
        switch (reflink.source.value) {
            case "hive": {
                let followerCount = (await PromiseIPC.send("distiller.getFollowerCount", reflink.toString()))
                return followerCount
            }
            case "orbitdb": {
                //Retrieve DB followers
            }
            default: {
                throw new Error("Unknown account provider")
            }
        }
    },
    /**
     * Retrieves "about" text for user profiles
     * @param {String|RefLink} reflink
     */
    async getProfileAbout(reflink) {
        if(!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink)
        }
        switch (reflink.source.value) {
            case "hive": {
		// type error: 2nd argument string does not match function signature
                let userAboutText = JSON.parse(
                    (await PromiseIPC.send(
                        "distiller.getAccount",
                        `hive:${reflink.root}` as any
                    ) as any).json_content.posting_json_metadata).profile.about
                return userAboutText;
            }
            case "orbitdb": {
                //Retrieve DB user about text
            }
            default: {
                throw new Error("Unknown account provider")
            }
        }
    },
    /**
     * Retrieves balances for user
     * @param {String|RefLink} reflink
     */
    async getAccountBalances(reflink) {
        if(!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink)
        }
        switch (reflink.source.value) {
            case "hive": {
                let accountBalances = (
		    // type error: 2nd argument (string) does not match function signature
                    (await PromiseIPC.send(
                        "distiller.getAccount",
                        `hive:${reflink.root}` as any)
                ) as any).json_content
                accountBalances = {
                    hive: accountBalances.balance,
                    hbd: accountBalances.sbd_balance
                }
                return accountBalances
            }
            case "orbitdb": {
                //not sure yet
            }
            default: {
                throw new Error("Unknown account provider")
            }
        }
    }
}
const video = {
    /**
     * Retrieves video source URL. Basic, gets first video source in list.
     * @todo Implement handling for multi video sources.
     * @param {String} permalink
     */
    async getVideoSourceURL(permalink) {
        let post_content;
        if (typeof permalink === "object") {
            post_content = permalink;
        } else {
            post_content = await accounts.permalinkToVideoInfo(permalink);
        }
        var videoSource = Finder.one.in(post_content.sources).with({
            type: "video"
        })
        if(videoSource) {
            try {
                var cid = ipfs.urlToCID(videoSource.url);
                let gateway;
                try {
		    // getGateway requires 2 arguments. passing empty object.
                    gateway = await ipfs.getGateway(cid, {});
                } catch (ex) {
                    console.log(ex)
                    throw ex;
                }
                return gateway + ipfs.urlToIpfsPath(videoSource.url);
            } catch {
                //return `https://cdn.3speakcontent.co/${reflink.root}/${reflink.permlink}`;
                return videoSource.url;
            }
        } else {
            throw new Error("Invalid post metadata");
        }
    },
    /**
     * Retrieves thumbnail URL.
     * @param {String|Object} permalink
     */
    async getThumbnailURL(permalink) {
        let post_content;
        if (typeof permalink === "object") {
            post_content = permalink;
        } else {
            try {
                post_content = await accounts.permalinkToVideoInfo(permalink);
            } catch {
                const reflink = RefLink.parse(permalink);
                return `https://threespeakvideo.b-cdn.net/${reflink.permlink}/thumbnails/default.png`
            }
        }
        const reflink = RefLink.parse(post_content.reflink);
        var thumbnailSource = Finder.one.in(post_content.sources).with({
            type: "thumbnail"
        })
        if(thumbnailSource) {
            try {
                var cid = ipfs.urlToCID(thumbnailSource.url);
                var gateway = await ipfs.getGateway(cid, true);
                return gateway + ipfs.urlToIpfsPath(thumbnailSource.url);
            } catch (ex) {
                return thumbnailSource.url;
                //return `https://threespeakvideo.b-cdn.net/${reflink.permlink}/thumbnails/default.png`
            }
        } else {
            return DefaultThumbnail;
            //throw new Error("Invalid post metadata");
        }
    }
}
const acctOps = {
    async login(data) {
        switch(data.accountType) {
            case "hive" : {
                try { 
                    const userAccounts = await hive.api.getAccountsAsync([data.username]);
                    console.log(userAccounts)
                    const pubWif = userAccounts[0].posting.key_auths[0][0];
    
                    const Valid = hive.auth.wifIsValid(data.key, pubWif);
    
                    if(Valid){
    
                        const profile = {
                            _id: userAccounts[0].id.toString(),
                            nickname: data.profile,
                            keyring: [
                                {
                                    type: 'hive',
                                    username: data.username,
                                    public: {
                                        pubWif
                                    },
                                    encrypted: data.encrypted,
                                    privateKeys: {
                                        posting_key: data.key
                                    }
                                }
                            ]
                        }
                        const profileID = profile._id;
                        const check_profile = (await PromiseIPC.send("accounts.has", profileID));
                        if (check_profile) {
                            throw new Error('Account exists already');
                        } else {
			    // 2nd argument doesn't match function signature - marking with any
                            (await PromiseIPC.send("accounts.createProfile", profile as any));
                            const get_profile = (await PromiseIPC.send("accounts.get", profileID));
                            localStorage.setItem('SNProfileID', profileID);
                            return get_profile;
                        }
                    } else {
                        throw new Error('Invalid posting key');
                    }
                } catch (error) {
                    throw error
                }
            }
        }
    },
    async getAccounts() {
        const getAccounts = (await PromiseIPC.send("accounts.ls", {} as any));
        
        return getAccounts;
    },
    async getAccount(profileID) {
        const getAccount = (await PromiseIPC.send("accounts.get", profileID));
        return getAccount;
    },
    async logout(profileID) {
        (await PromiseIPC.send("accounts.deleteProfile", profileID));
        return;
    },
    async voteHandler(voteOp) {
        switch(voteOp.accountType) {
            case "hive" : {
                const weight = voteOp.weight * 100
                const theWif = voteOp.wif
                hive.broadcast.vote(
                    theWif,
                    voteOp.voter,
                    voteOp.author,
                    voteOp.permlink,
                    weight,
                    function(error, succeed) {
                    if (error) {
                        console.log(error)
                        console.log('Error encountered')
                    }

                    if (succeed) {
                        console.log('success');
                    }
                });
            }
        }
    },
    async followHandler(profileID, followOp) {
        switch(followOp.accountType) {
            case "hive" : {
                //const profile = await acctOps.getAccount(profileID);
                const profile = await acctOps.getAccount(profileID) as any;
               
                const username = Finder.one.in(profile.keyring).with({type:"hive"}).username
                const theWifObj = Finder.one.in(profile.keyring).with({
                    type: "hive"
                })
                const wif = theWifObj.privateKeys.posting_key // posting key
                let jsonObj = ['follow', {follower: username, following: followOp.author, what: followOp.what ? [followOp.what] : []}]

                console.log(hive.broadcast.customJson(
                    wif,
                    [],
                    [username],
                    'follow',
                    JSON.stringify(jsonObj), async (error, succeed) => {
                        if (error) {
                            console.log(error)
                            console.log('Error encountered')
                        }

                        if (succeed) {
                            console.log(succeed)
                            console.log('success')
                        }
                }))
            }
        }
    },
    async postComment(commentOp) {
        console.log(commentOp)
        switch (commentOp.accountType) {
            case "hive": {
                /*await hiveClient.broadcast
                    .comment(
                        {
                            author: commentOp.username,
                            title: commentOp.title,
                            body: commentOp.body,
                            json_metadata: typeof commentOp.json_metadata === "object" ? JSON.stringify(commentOp.json_metadata) : commentOp.json_metadata,
                            parent_author: '',
                            tags: commentOp.tags,
                            parent_permlink: commentOp.tags[0],
                            permlink: commentOp.permlink,
                        },
                        PrivateKey.fromLogin(commentOp.username, commentOp.wif, "posting")
                    )*/
                const profileID = window.localStorage.getItem("SNProfileID") as any
                const getAccount = (await PromiseIPC.send("accounts.get", profileID)) as any;
                const hiveInfo = Finder.one.in(getAccount.keyring).with({type:"hive"})

                if(!commentOp.json_metadata) {
                    commentOp.json_metadata = {}
                }

                console.log(hiveInfo)
                console.log(getAccount)
                let json_metadata;
                if(typeof commentOp.json_metadata === "object") {
                    //Note: this is for peakd/hive.blog to display a video preview
                    if(!commentOp.parent_author) {
                        commentOp.json_metadata.video.info = {
                            author: hiveInfo.username,
                            permlink: commentOp.permlink
                        }
                    }
                    json_metadata = JSON.stringify(commentOp.json_metadata) 
                }  else {
                    throw new Error("commentOp.json_metadata must be an object")
                }
                let body;
                if(!commentOp.parent_author) {
                    let header;
                    if(commentOp.json_metadata.sourceMap) {
                        let thumbnailSource = Finder.one.in(commentOp.json_metadata.sourceMap).with({
                            type: "thumbnail"
                        })
                        try {
                            var cid = ipfs.urlToCID(thumbnailSource.url);
                            var gateway = await ipfs.getGateway(cid, true);
                            const imgSrc = gateway + ipfs.urlToIpfsPath(thumbnailSource.url)
                            header = `[![](${imgSrc})](https://3speak.tv/watch?v=${hiveInfo.username}/${commentOp.permlink})<br/>`;
                        } catch (ex) { }
                    }
                    if(header) {
                        body = `${header} ${commentOp.body} <br/> [▶️Watch on 3Speak Dapp](https://3speak.tv/openDapp?uri=hive:${hiveInfo.username}:${commentOp.permlink})`
                    } else {
                        body = `${commentOp.body} <br/> [▶️Watch on 3Speak Dapp](https://3speak.tv/openDapp?uri=hive:${hiveInfo.username}:${commentOp.permlink})`
                    }
                    
                } else {
                    body = commentOp.body;
                }
                var out = await hive.broadcast.comment(
                    hiveInfo.privateKeys.posting_key,
                    commentOp.parent_author || "",
                    commentOp.parent_permlink || commentOp.tags[0] || "threespeak", //parentPermlink
                    hiveInfo.username,
                    commentOp.permlink,
                    commentOp.title,
                    body,
                    json_metadata
                );
                console.log(out)
                return [`hive:${hiveInfo.username}:${commentOp.permlink}`, out];
            }
        }
    },
    async createPost(postOp) {
        switch(postOp.accountType) {
            case "hive" : {
                const theWif = postOp.wif
                
                hive.broadcast.comment(
                    theWif,
                    '',
                    postOp.parentPermlink,
                    postOp.author,
                    postOp.permlink,
                    postOp.title,
                    postOp.body,
                    postOp.jsonMetadata,
                    function(error, succeed) {
                        console.log('Bout to check')
                        if (error) {
                            console.log(error)
                            console.log('Error encountered')
                        }
    
                        if (succeed) {
                            console.log('succeed');
                        }
                    }
                );
            }
        }
    },
    async getFollowing() {
        const profileID = window.localStorage.getItem("SNProfileID") 
	// String does not match 2nd argument for send function signature
        const getAccount = (await PromiseIPC.send("accounts.get", profileID as any)) as any
        const hiveInfo = Finder.one.in(getAccount.keyring).with({type:"hive"})

        let out = [];
        let done = false;
        let nextFollow = "";
        const limit = 100;
        while(done === false) {
            const followingChunk = await hiveClient.call('follow_api', 'get_following', [
                hiveInfo.username,
                nextFollow,
                "blog",
                limit,
            ])
            console.log(followingChunk)
            out.push(...followingChunk)
            if(followingChunk.length !== limit) {
                break;
            }
            nextFollow = followingChunk[followingChunk.length - 1].following
        }
        return out;
    }
}
export default {
    accounts,
    video,
    ipfs,
    acctOps,
    formToObj: (formData): any => {
        let out = {};
        for(var key of formData.keys()) {
            out[key] = formData.get(key);
        }
        return out;
    }
}