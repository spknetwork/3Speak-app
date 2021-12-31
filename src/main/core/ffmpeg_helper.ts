// let os = require('os');
import os from 'os'
const fs = require('fs')
const path = require('path')
const appRoot = require('app-root-path')
function verifyFile(file) {
  try {
    const stats = fs.statSync(file)
    return stats.isFile()
  } catch (ignored) {
    return false
  }
}
export function GetFfmpegPath() {
  const platform = os.platform() + '-' + os.arch()

  const packageName = '@ffmpeg-installer/' + platform
  if (!require('@ffmpeg-installer/ffmpeg/package.json').optionalDependencies[packageName]) {
    throw 'Unsupported platform/architecture: ' + platform
  }

  const appRootPath = appRoot.path //.split(require('path').sep).join(path.posix.sep);

  const binary = os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'

  const topLevelPath = path.resolve(
    appRootPath.substr(0, appRootPath.indexOf('node_modules')),
    'node_modules',
    '@ffmpeg-installer',
    platform,
  )
  const npm3Path = path.resolve(appRootPath, '..', platform)
  const npm2Path = path.resolve(appRootPath, 'node_modules', '@ffmpeg-installer', platform)
  const npm4Path = path.resolve(appRootPath, '..', 'node_modules', '@ffmpeg-installer', platform)

  const topLevelBinary = path.join(topLevelPath, binary)
  const npm3Binary = path.join(npm3Path, binary)
  const npm2Binary = path.join(npm2Path, binary)
  const npm4Binary = path.join(npm4Path, binary)

  let ffmpegPath, packageJson

  if (verifyFile(npm3Binary)) {
    ffmpegPath = npm3Binary
    const topLevelPackage = `${npm3Path}/package.json`
    packageJson = JSON.parse(fs.readFileSync(topLevelPackage))
  } else if (verifyFile(npm2Binary)) {
    ffmpegPath = npm2Binary
    const topLevelPackage = `${npm2Path}/package.json`
    packageJson = JSON.parse(fs.readFileSync(topLevelPackage))
  } else if (verifyFile(topLevelBinary)) {
    ffmpegPath = topLevelBinary
    const topLevelPackage = `${topLevelPath}/package.json`
    packageJson = JSON.parse(fs.readFileSync(topLevelPackage))
  } else if (verifyFile(npm4Binary)) {
    ffmpegPath = npm4Binary
    const topLevelPackage = `${npm4Path}/package.json`
    packageJson = JSON.parse(fs.readFileSync(topLevelPackage)) //Fix for webpack in production
  } else {
    throw (
      'Could not find ffmpeg executable, tried   "' +
      npm4Binary +
      '", "' +
      npm3Binary +
      '", "' +
      npm2Binary +
      '" and "' +
      topLevelBinary +
      '"'
    )
  }
  return ffmpegPath
}
