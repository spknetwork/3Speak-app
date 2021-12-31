const Path = require('path')
const os = require('os')

function getRepoPath() {
  let appPath
  if (process.env.speak_path) {
    appPath = process.env.speak_path
  } else {
    appPath = Path.join(os.homedir(), '.blasio')
  }
  return appPath
}
module.exports = {
  getRepoPath,
}
