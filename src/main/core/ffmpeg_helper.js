var os = require('os');
var fs = require('fs');
var path = require('path');
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
    var npm3Path = path.resolve(__dirname, '..', platform);
    var npm2Path = path.resolve(__dirname, 'node_modules', '@ffmpeg-installer', platform);
    var npm4Path = path.resolve(__dirname, '..', 'node_modules', '@ffmpeg-installer', platform);

    var topLevelBinary = path.join(topLevelPath, binary);
    var npm3Binary = path.join(npm3Path, binary);
    var npm2Binary = path.join(npm2Path, binary);
    var npm4Binary = path.resolve(npm4Path, binary);

    var topLevelPackage = `${npm4Path}/package.json`
    var ffmpegPath, packageJson;

    if (verifyFile(npm3Binary)) {
        ffmpegPath = npm3Binary;
        packageJson = JSON.parse(fs.readFileSync(topLevelPackage));
    } else if (verifyFile(npm2Binary)) {
        ffmpegPath = npm2Binary;
        packageJson = JSON.parse(fs.readFileSync(topLevelPackage));
    } else if (verifyFile(topLevelBinary)) {
        ffmpegPath = topLevelBinary;
        packageJson = JSON.parse(fs.readFileSync(topLevelPackage));
    } else if (verifyFile(npm4Binary)) {
        ffmpegPath = npm4Binary;
        packageJson = JSON.parse(fs.readFileSync(topLevelPackage)); //Fix for webpack in production
    } else {
        throw 'Could not find ffmpeg executable, tried   "' + npm4Binary + '", "' + npm3Binary + '", "' + npm2Binary + '" and "' + topLevelBinary + '"';
    }
    return ffmpegPath;
}

module.exports = {
    GetFfmpegPath
}