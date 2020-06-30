import PromiseIPC from 'electron-promise-ipc';

export default {
    async permalinkToVideoInfo(permalink) {
        const post_content = (await PromiseIPC.send("postdb.fetch", permalink)).json_content;
        const json_metadata = JSON.parse(post_content.json_metadata);
        const video_info = json_metadata.video.info;
        console.log(permalink);
        return {
            source: "URL", //Reserved for URL/IPFS differentiation. 
            format: video_info.file.split(".")[1], //Reserved if a different player must be used on a per format basis.
            url: `https://cdn.3speakcontent.online/${video_info.permlink}/${video_info.file}`,
            duration: video_info.duration,
            title: video_info.title
        }
    },
    async permalinkToPostInfo(permalink) {
        const post_content = (await PromiseIPC.send("postdb.fetch", permalink)).json_content;
        return post_content;
    }
}