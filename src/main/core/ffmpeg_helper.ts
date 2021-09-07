// var os = require('os');
import os from 'os'
var fs = require('fs');
var path = require('path');
var appRoot = require('app-root-path');
function verifyFile(file) {
    try {
        var stats = fs.statSync(file);
        return stats.isFile();
    } catch (ignored) {
        return false;
    }
}
function GetFfmpegPath() {
    
    var platform = os.platform() + '-' + os.arch();

    var packageName = '@ffmpeg-installer/' + platform;
    if (!require('@ffmpeg-installer/ffmpeg/package.json').optionalDependencies[packageName]) {
        throw 'Unsupported platform/architecture: ' + platform;
    }

    var appRootPath = appRoot.path;//.split(require('path').sep).join(path.posix.sep);
    
    var binary = os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';

    var topLevelPath = path.resolve(appRootPath.substr(0, appRootPath.indexOf('node_modules')), 'node_modules', '@ffmpeg-installer', platform);
    var npm3Path = path.resolve(appRootPath, '..', platform);
    var npm2Path = path.resolve(appRootPath, 'node_modules', '@ffmpeg-installer', platform);
    var npm4Path = path.resolve(appRootPath, '..', 'node_modules', '@ffmpeg-installer', platform);

    var topLevelBinary = path.join(topLevelPath, binary);
    var npm3Binary = path.join(npm3Path, binary);
    var npm2Binary = path.join(npm2Path, binary);
    var npm4Binary = path.join(npm4Path, binary);
    
    var ffmpegPath, packageJson;
    
    if (verifyFile(npm3Binary)) {
        ffmpegPath = npm3Binary;
        var topLevelPackage = `${npm3Path}/package.json`
        packageJson = JSON.parse(fs.readFileSync(topLevelPackage));
    } else if (verifyFile(npm2Binary)) {
        ffmpegPath = npm2Binary;
        var topLevelPackage = `${npm2Path}/package.json`
        packageJson = JSON.parse(fs.readFileSync(topLevelPackage));
    } else if (verifyFile(topLevelBinary)) {
        ffmpegPath = topLevelBinary;
        var topLevelPackage = `${topLevelPath}/package.json`
        packageJson = JSON.parse(fs.readFileSync(topLevelPackage));
    } else if (verifyFile(npm4Binary)) {
        ffmpegPath = npm4Binary;
        var topLevelPackage = `${npm4Path}/package.json`
        packageJson = JSON.parse(fs.readFileSync(topLevelPackage)); //Fix for webpack in production
    } else {
        throw 'Could not find ffmpeg executable, tried   "' + npm4Binary + '", "' + npm3Binary + '", "' + npm2Binary + '" and "' + topLevelBinary + '"';
    }
    return ffmpegPath;
}

module.exports = {
    GetFfmpegPath
}