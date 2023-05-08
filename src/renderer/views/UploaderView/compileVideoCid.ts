export const compileVideoCid = async (videoInfo, thumbnailInfo, ipfs) => {
  const videoCid = videoInfo.cid;
  if (thumbnailInfo.cid) {
    const obj = await ipfs.current.object.stat(thumbnailInfo.cid);
    const output = await ipfs.current.object.patch.addLink(videoCid, {
      name: thumbnailInfo.path,
      size: thumbnailInfo.size,
      cid: thumbnailInfo.cid,
    });
    return output.toString();
  }
  return videoCid;
};
