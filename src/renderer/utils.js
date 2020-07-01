import PromiseIPC from 'electron-promise-ipc';

export default {
    async permalinkToVideoInfo(permalink) {
        const post_content = (await PromiseIPC.send("postdb.fetch", permalink)).json_content;
        switch(permalink.split("/")[0]) {
            case "hive": {
                const json_metadata = JSON.parse(post_content.json_metadata);
                const video_info = json_metadata.video.info;
                console.log(permalink);
                return {
                    source: "URL", //Reserved for URL/IPFS differentiation. 
                    format: video_info.file.split(".")[1], //Reserved if a different player must be used on a per format basis.
                    url: `https://cdn.3speakcontent.online/${video_info.permlink}/${video_info.file}`,
                    duration: video_info.duration,
                    title: video_info.title,
                    description: json_metadata.video.content.description,
                    tags: json_metadata.tags
                }
            }
            default: {
                throw "Invalid permalink source"
            }
        }
    },
    async permalinkToPostInfo(permalink) {
        const post_content = (await PromiseIPC.send("postdb.fetch", permalink)).json_content;
        return post_content;
    }
}