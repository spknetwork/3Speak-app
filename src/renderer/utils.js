import PromiseIPC from 'electron-promise-ipc';
import axios from 'axios';
import ArraySearch from 'arraysearch';
import RefLink from '../main/RefLink';
import ipfsHandler from '../main/core/components/ipfsHandler'
import CID from 'cids'
import IpfsUtils from 'ipfs-core/src/utils'
const Finder = ArraySearch.Finder;
const hive = require('@hiveio/hive-js');
const CryptoJS = require('crypto-js');
const encryptWithAES = text => {
    const passphrase = '123';
    return CryptoJS.AES.encrypt(text, passphrase).toString();
};

const decryptWithAES = ciphertext => {
    const passphrase = '123';
    const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
};

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
    /**
     * Retrieves post information from reflink.
     * @param {String|RefLink} reflink
     */
    async permalinkToPostInfo(reflink) {
        if(!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink)
        }
        const post_content = (await PromiseIPC.send("distiller.getContent", reflink.toString())).json_content;
        return post_content;
    },
    /**
     * Retrieves post information as videoInfo from reflink.
     * @param {String|RefLink} reflink
     */
    async permalinkToVideoInfo(reflink, options = {}) {
        if(!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink)
        }
        if(!options.type) {
            options.type == "*"
        }
        var post_content = (await PromiseIPC.send("distiller.getContent", reflink.toString())).json_content
        if(!post_content) {
            throw new Error("Invalid post content. Empty record");
        }
        switch (reflink.source.value) {
            case "hive": {
                const json_metadata = post_content.json_metadata;
                if(!(json_metadata.app && json_metadata.type.includes("3speak/video")) && options.type === "video") {
                    throw new Error("Invalid post content. Not a video");
                }
                let sources = [];
                let title;
                let description;
                let duration;
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
                var json_content = (await PromiseIPC.send("distiller.getAccount", reflink.toString())).json_content
                if(!json_content) {
                    throw new Error("Invalid account data content. Empty record");
                }
                json_content.posting_json_metadata = JSON.parse(json_content.posting_json_metadata)
                return json_content.posting_json_metadata.profile.cover_image;
            }
            case "orbitdb": {
                //Retrieve IPFS profile picture CID.
            }
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
            case "orbitdb": {
                //Retrieve IPFS profile picture CID.
            }
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
                let userAboutText = JSON.parse(
                    (await PromiseIPC.send(
                        "distiller.getAccount",
                        `hive:${reflink.root}`
                    )).json_content.posting_json_metadata).profile.about
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
                    await PromiseIPC.send(
                        "distiller.getAccount",
                        `hive:${reflink.root}`)
                ).json_content
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
                    gateway = await ipfs.getGateway(cid);
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
                return `https://threespeakvideo.b-cdn.net/${reflink.permlink}/thumbnails/default.png`
            }
        } else {
            return `https://threespeakvideo.b-cdn.net/${reflink.permlink}/thumbnails/default.png`
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
                    const wif = hive.auth.toWif(data.key)
    
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
                                        posting_key: encryptWithAES(data.key)
                                    }
                                }
                            ]
                        }
                        const profileID = profile._id;
                        const check_profile = (await PromiseIPC.send("accounts.has", profileID));
                        if (check_profile) {
                            throw new Error('Account exists already');
                        } else {
                            (await PromiseIPC.send("accounts.createProfile", profile));
                            const get_profile = (await PromiseIPC.send("accounts.get", profileID));
                            localStorage.removeItem('SNProfileID');
                            localStorage.setItem('SNProfileID', profileID);
                            return get_profile;
                        }
                    } else {
                        throw new Error('Invalid posting key');
                        alert("Invalid posting key");
                    }
                } catch (error) {
                    console.log(error)
                    console.log('Error encountered')
                }
            }
        }
    },
    async getAccounts() {
        const getAccounts = (await PromiseIPC.send("accounts.ls", {}));
        
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
                const theWif = decryptWithAES(voteOp.wif)
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
                        window.location.reload();
                    }
                });
            }
        }
    },
    async followHandler(followOp) {
        switch(followOp.accountType) {
            case "hive" : {
                const theWif = decryptWithAES(followOp.wif)

                let jsonObj = ['follow', {follower: followOp.username, following: followOp.author, what: [followOp.what]}]

                hive.broadcast.customJson(
                    theWif,
                    [],
                    [followOp.username],
                    'follow',
                    JSON.stringify(jsonObj), async (error, succeed) => {
                        if (error) {
                            console.log(error)
                            console.log('Error encountered')
                        }

                        if (succeed) {
                            console.log('success')
                            window.location.reload();
                        }
                });
            }
        }
    },
    async postComment(commentOp) {
        switch(comment.accountType) {
            case "hive" : {
                const theWif = decryptWithAES(commentOp.wif)
                hive.broadcast.comment(
                    theWif,
                    commentOp.parentAuthor,
                    commentOp.parentPermlink,
                    commentOp.author,
                    commentOp.permlink,
                    commentOp.title,
                    commentOp.body,
                    commentOp.jsonMetadata,
                    function(error, succeed) {
                        console.log('Bout to check')
                        if (error) {
                            console.log(error)
                            console.log('Error encountered')
                        }
    
                        if (succeed) {
                            console.log('succeed');
                            window.location.reload()
                        }
                    }
                );
            }
        }
    }
}
export default {
    accounts,
    video,
    ipfs,
    acctOps,
    formToObj: (formData) => {
        let out = {};
        for(var key of formData.keys()) {
            out[key] = formData.get(key);
        }
        return out;
    }
}