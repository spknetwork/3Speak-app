import PromiseIPC from 'electron-promise-ipc';
import axios from 'axios';
import ArraySearch from 'arraysearch'
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
        const post_content = (await PromiseIPC.send("distiller.getContent", reflink.toString())).json_content;
        switch (reflink.source.value) {
            case "hive": {
                const json_metadata = post_content.json_metadata;
                const video_info = json_metadata.video.info;
                let sources = [];
                if(video_info.file) {
                    sources.push({
                        type: "video",
                        url: await video.getVideoSourceURL(reflink),

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
                    url: await video.getThumbnailURL(reflink)
                })
                return {
                    sources,
                    duration: video_info.duration,
                    creation: new Date(post_content.created).toISOString(),
                    title: video_info.title,
                    description: json_metadata.video.content.description,
                    tags: json_metadata.tags,
                    refs: [`hive/${video_info.author}/${video_info.permlink}`], //Reserved for future use when multi account system support is added.
                    meta: {}, //Reserved for future use.
                    reflink: `hive/${video_info.author}/${video_info.permlink}`
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
        const reflink = RefLink.parse(post_content.reflink);
        const find = new Finder();
        var videoSource = find.one.in(post_content.sources).with({
            type: "video"
        })
        if(videoSource) {
            try {
                return ipfs.compileURL(ipfs.urlToCID(videoSource.file));
            } catch {
                return `https://cdn.3speakcontent.online/${reflink.root}/${reflink.permlink}`;
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
            post_content = await accounts.permalinkToPostInfo(permalink);
        }
        const reflink = RefLink.parse(post_content.reflink);
        const find = new Finder();
        var imageSource = find.one.in(post_content.sources).with({
            type: "thumbnail"
        })
        if(videoSource) {
            try {
                return ipfs.compileURL(ipfs.urlToCID(imageSource.file));
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