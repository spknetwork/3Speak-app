export const videoSelect = (e, setVideoSourceFile, setLogData, logData, videoInfo) => {
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
};
