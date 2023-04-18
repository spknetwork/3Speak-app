import { knex } from '../../../singletons/knex.singleton';
import PromiseIpc from 'electron-promise-ipc';
import ArraySearch from 'arraysearch';
const Finder = ArraySearch.Finder;

export async function retrieveRecommended(
  postInfo: any,
  setRecommendedVideos: (videos: any[]) => void
) {
  const query = knex.raw(
    `SELECT TOP 25 x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND category LIKE '${postInfo.category}' ORDER BY NEWID()`,
  );
  const blob = [];
  query.stream().on('data', async (val) => {
    if (
      await PromiseIpc.send(
        'blocklist.has',
        `hive:${val.author}:${val.permlink}` as any
      )
    ) {
      console.log(`${val.author} is blocked`);
      return;
    }
    val.json_metadata = JSON.parse(val.json_metadata);
    //console.log(val)
    if (!val.json_metadata.video) {
      val.json_metadata.video = {
        info: {},
      };
    }
    let thumbnail;
    if (val.json_metadata.sourceMap) {
      thumbnail = Finder.one
        .in(val.json_metadata.sourceMap)
        .with({ type: 'thumbnail' }).url;
      console.log(thumbnail);
    }
    blob.push({
      reflink: `hive:${val.author}:${val.permlink}`,
      created: val.created,
      author: val.author,
      permlink: val.permlink,
      tags: val.json_metadata.tags,
      title: val.title,
      duration:
        val.json_metadata.video.info.duration ||
        val.json_metadata.video.duration,
      isIpfs: val.json_metadata.video.info.ipfs || thumbnail ? true : false,
      ipfs: val.json_metadata.video.info.ipfs,
      images: {
        ipfs_thumbnail: thumbnail
          ? `/ipfs/${thumbnail.slice(7)}`
          : `/ipfs/${val.json_metadata.video.info.ipfsThumbnail}`,
        thumbnail: `https://threespeakvideo.b-cdn.net/${val.permlink}/thumbnails/default.png`,
        poster: `https://threespeakvideo.b-cdn.net/${val.permlink}/poster.png`,
        post: `https://threespeakvideo.b-cdn.net/${val.permlink}/post.png`,
      },
      views: val.total_vote_weight
        ? Math.log(val.total_vote_weight / 1000).toFixed(2)
        : 0,
    });

    setRecommendedVideos(blob);
  });
  query.on('query-response', (ret, det, aet) => {
    console.log(ret, det, aet);
  });
  query.on('end', (err) => {
    console.log(err);
  });
}
