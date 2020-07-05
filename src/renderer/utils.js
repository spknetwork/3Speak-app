import PromiseIPC from 'electron-promise-ipc';
import axios from 'axios';

//TODO move ipfs, accounts and post related utils into a separate class or even main process.

const ipfs = {
    gateway: "https://ipfs.io/ipfs/",
    compileURL(cid) {
        return ipfs.gateway + cid.toString()
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
    async permalinkToPostInfo(permalink) {
        const post_content = (await PromiseIPC.send("postdb.fetch", permalink)).json_content;
        return post_content;
    },
    async permalinkToVideoInfo(permalink) {
        const post_content = (await PromiseIPC.send("postdb.fetch", permalink)).json_content;
        switch (permalink.split("/")[0]) {
            case "hive": {
                const json_metadata = JSON.parse(post_content.json_metadata);
                const video_info = json_metadata.video.info;
                return {
                    sources: {
                        video: {
                            url: await video.getSourceURL(permalink),

                            /**
                             * Reserved if a different player must be used on per format basis.
                             * 
                             * If multi-resolution support is added in the future continue to use the url/format scheme.
                             * url should link to neccessary metadata.
                             */
                            format: video_info.file.split(".")[1]
                        },
                        thumbnail: await video.getThumbnailURL(permalink)
                    },
                    duration: video_info.duration,
                    title: video_info.title,
                    description: json_metadata.video.content.description,
                    tags: json_metadata.tags,
                    refs: [`hive/${video_info.author}/${video_info.permlink}`], //Reserved for future use when multi account system support is added.
                    meta: {} //Reserved for future use.
                }
            }
            default: {
                throw new Error("Unknown account provider")
            }
        }
    },
    async getProfilePictureURL(accountString) {
        const splitted = accountString.split("/");
        var provider = splitted[0];
        var author = splitted[1];

        switch (provider) {
            case "hive": {
                var avatar_url = `https://images.hive.blog/u/${author}/avatar`;
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
     * Retrieves
     * @param {String} permalink 
     */
    async getSourceURL(permalink) {
        let post_content;
        if (typeof permalink === "object") {
            post_content = permalink;
        } else {
            post_content = await accounts.permalinkToPostInfo(permalink);
        }
        const json_metadata = JSON.parse(post_content.json_metadata);
        try {
            const video_info = json_metadata.video.info;
            var file = video_info.file;
            try {
                return ipfs.compileURL(ipfs.urlToCID(file));
            } catch {
                return `https://cdn.3speakcontent.online/${video_info.permlink}/${video_info.file}`;
            }
        } catch {
            throw new Error("Invalid post metadata");
        }
    },
    async getThumbnailURL(permalink) {
        let post_content;
        if (typeof permalink === "object") {
            post_content = permalink;
        } else {
            post_content = await accounts.permalinkToPostInfo(permalink);
        }
        try {
            const json_metadata = JSON.parse(post_content.json_metadata);
            if(json_metadata.image)
                try {
                    //TODO: Code to handle ipfs thumbnails.
                    ipfs.urlToCID(json_metadata.image);
                } catch {
                    return json_metadata.image[0];
                }
            else {
                return `https://img.3speakcontent.online/${post_content.permlink}/thumbnail.png`
            }
        } catch {
            throw new Error("Invalid post metadata")
        }
    }
}
export default {
    accounts,
    video,
    ipfs
}