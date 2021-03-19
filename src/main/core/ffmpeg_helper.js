var os = require('os');
var fs = require('fs');
var path = require('path').posix;
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


    var binary = os.platform() === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';

    var topLevelPath = path.resolve(__dirname.substr(0, __dirname.indexOf('node_modules')), 'node_modules', '@ffmpeg-installer', platform);
    var npm3Path = path.resolve(appRoot.path, '..', platform);
    var npm2Path = path.resolve(appRoot.path, 'node_modules', '@ffmpeg-installer', platform);
    var npm4Path = path.resolve(appRoot.path, '..', 'node_modules', '@ffmpeg-installer', platform);

    var topLevelBinary = path.join(topLevelPath, binary);
    var npm3Binary = path.join(npm3Path, binary);
    var npm2Binary = path.join(npm2Path, binary);
    var npm4Binary = path.resolve(npm4Path, binary);

    var ffmpegPath, packageJson;
    
    if (verifyFile(npm3Binary)) {
        ffmpegPath = npm3Binary;
        var topLevelPackage = `${npm3Path}/package.json`
        packageJson = JSON.parse(fs.readFileSync(topLevelPackage));
    } else if (verifyFile(npm2Binary)) {
        console.log(npm2Binary)
        ffmpegPath = npm2Binary;
        var topLevelPackage = `${npm2Path}/package.json`
        packageJson = JSON.parse(fs.readFileSync(topLevelPackage));
    } else if (verifyFile(topLevelBinary)) {
        ffmpegPath = topLevelBinary;
        var topLevelPackage = `${topLevelPath}/package.json`
        packageJson = JSON.parse(fs.readFileSync(topLevelPackage));
    } else if (verifyFile(npm4Binary)) {
        ffmpegPath = npm4Binary;
        var topLevelPackage = `${npm4Binary}/package.json`
        packageJson = JSON.parse(fs.readFileSync(topLevelPackage)); //Fix for webpack in production
    } else {
        throw 'Could not find ffmpeg executable, tried   "' + npm4Binary + '", "' + npm3Binary + '", "' + npm2Binary + '" and "' + topLevelBinary + '"';
    }
    return ffmpegPath;
}

module.exports = {
    GetFfmpegPath
}