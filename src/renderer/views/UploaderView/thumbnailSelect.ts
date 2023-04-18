export const thumbnailSelect = async ({e, thumbnailPreview, setThumbnailInfo, setVideoSourceFile, setLogData, ipfs, logData, videoInfo}) => {
  console.log(`handling thumbnail selectr`)

  let file
  if (e.target && e.target.files) {
    file = e.target.files[0]
  } else if (e.dataTransfer && e.dataTransfer.files) {
    file = e.dataTransfer.files[0]
  }
  if (file) {
    setVideoSourceFile(file.path)
    setLogData([...logData, `Selected: ${videoInfo.path}`])
  }
  const imgblob = URL.createObjectURL(file)
  const size = file.size

  console.log(`uploading file with size ${size}`)

  thumbnailPreview.current = imgblob

  const fileDetails = {
    path: e.target.files[0].name,
    content: e.target.files[0],
  }

  const ipfsOut = await ipfs.current.add(fileDetails, { pin: false })
  console.log(`setting thumbnail info to cid`, ipfsOut.cid.toString())

  setThumbnailInfo({
    size,
    path: `thumbnail.${file.type.split('/')[1]}`,
    cid: ipfsOut.cid.toString(),
  })
};