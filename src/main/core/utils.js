const Path = require('path');
const os = require('os');

function getRepoPath() {
    let blasioPath;
    if (process.env.blasio_path) {
        blasioPath = process.env.blasio_path;
    } else {
        blasioPath = Path.join(os.homedir(), ".blasio");
    }
    return blasioPath;
}
module.exports = {
    getRepoPath
}