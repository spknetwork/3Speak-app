import PromiseIPC from 'electron-promise-ipc';
import axios from 'axios';
import ArraySearch from 'arraysearch';
import RefLink from '../main/RefLink';
const Finder = ArraySearch.Finder;

const ipfs = {
    gateway: "https://ipfs.io/ipfs/",
    compileURL(cid) {
        return ipfs.gateway + cid.toString();
    },
    urlToCID(url) {
        url = new URL(url);
        if (url.protocol === "ipfs:") {
            return url.host;
        } else {
            throw new Error("Invalid IPFS url");
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
    async permalinkToVideoInfo(reflink) {
        if(!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink)
        }
        console.log(reflink)
        var post_content = (await PromiseIPC.send("distiller.getContent", reflink.toString())).json_content
        if(!post_content) {
            throw new Error("Invalid post content. Empty record");
        }
        switch (reflink.source.value) {
            case "hive": {
                const json_metadata = post_content.json_metadata;

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
                    if(video_info.file) {
                        sources.push({
                            type: "video",
                            url: `https://cdn.3speakcontent.online/${reflink.permlink}/${video_info.file}`,
                            /**
                             * Reserved if a different player must be used on per format basis.
                             * 
                             * If multi-resolution support is added in the future continue to use the url/format scheme.
                             * url should link to neccessary metadata.
                             */
                            format: video_info.file.split(".")[1]
                        })
                    }
                    sources.push({
                        type: "thumbnail",
                        url: `https://img.3speakcontent.online/${reflink.permlink}/thumbnail.png`
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
    /**
     * Retrieves Account profile picture URL.
     * @todo Future item: Pull image from URL, then store locally for later use.
     * @param {String|RefLink} reflink 
     */
    async getProfilePictureURL(reflink) {
        if(!(reflink instanceof RefLink)) {
            reflink = RefLink.parse(reflink);
        }

        switch (reflink.source.value) {
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
                    )).json_content.json_metadata).profile.about

                return userAboutText
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
                console.log(accountBalances)
                accountBalances = {
                    hive: accountBalances.balance,
                    hbd: accountBalances.sbd_balance
                }
                console.log(accountBalances)
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
                return ipfs.compileURL(ipfs.urlToCID(videoSource.url));
            } catch {
                //return `https://cdn.3speakcontent.online/${reflink.root}/${reflink.permlink}`;
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
            post_content = await accounts.permalinkToVideoInfo(permalink);
        }
        const reflink = RefLink.parse(post_content.reflink);
        var imageSource = Finder.one.in(post_content.sources).with({
            type: "thumbnail"
        })
        if(imageSource) {
            try {
                return ipfs.compileURL(ipfs.urlToCID(imageSource.url));
            } catch {
                return `https://img.3speakcontent.online/${reflink.permlink}/thumbnail.png`
            }
        } else {
            throw new Error("Invalid post metadata");
        }
    }
}
export default {
    accounts,
    video,
    ipfs
}