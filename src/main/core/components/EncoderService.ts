const tmp = require('tmp');
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

let ffmpegPath
if(process.env.NODE_ENV === 'development') { 
    ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
} else {
    //ffmpegPath = (path.join(__dirname, '..\\node_modules\\@ffmpeg-installer\\win32-x64\\ffmpeg.exe' ));
    try { 
        ffmpegPath = require('../ffmpeg_helper').GetFfmpegPath();

    } catch (ex) {
        console.log(ex)
    }
}
console.log(`d is ${require('../ffmpeg_helper').GetFfmpegPath()}`)
ffmpeg.setFfmpegPath(ffmpegPath)
const EventEmitter = require('events');
const { uuidv4 } = require('uuid');
//const sharp = require('sharp')
const {globSource} = require('ipfs-http-client')

const MAX_BIT_RATE = {
    '1080': '2760k',
    '720': '1327k',
    '480': '763k',
    '360': '423k',
    '240': '155k',
    '144': '640k'
}
const tutils = {
    /**
   * get an array of possible downsampled bitrates
   * @param  {number} height Video height, grabbed from ffmpeg probe
   * @return {array}        Array of possible downsample sizes.
   */
    getPossibleBitrates: function (height) {
        if (!height) {
            return null
        }

        if (height < 144) {
            // very small bitrate, use the original format.
            return ['?x' + height]
        } else if (height < 240) {
            return ['?x144']
        } else if (height < 360) {
            return ['?x240', '?x144']
        } else if (height < 480) {
            return ['?x360', '?x240', '?x144']
        } else if (height < 720) {
            return ['?x480', '?x360', '?x240', '?x144']
        } else if (height < 1080) {
            return ['?x720', '?x480', '?x360', '?x240', '?x144']
        } else if (height < 1440) {
            return ['?x1080', '?x720', '?x480', '?x360', '?x240', '?x144']
        } else if (height < 2160) {
            return ['?x1440', '?x1080', '?x720', '?x480', '?x360', '?x240', '?x144']
        } else {
            return ['?x2160', '?x1440', '?x1080', '?x720', '?x480', '?x360', '?x240', '?x144']
        }
    },
    getBandwidth: function (height) {
        if (!height) {
            return null
        }

        // default to the lowest height. in case the video is smaller than that.
        return MAX_BIT_RATE[String(height)] || MAX_BIT_RATE['144']
    },
    /**
     * get video height from size String
     * @param  {String} size string from ffmpeg @example '?x720'
     * @return {number}      height integer.
     */
    getHeight: function a(size) {
        return parseInt(size.split('x')[1])
    },
    calculateWidth: function (codecData, currentHeight) {
        let resString = /^\d{3,}x\d{3,}/g // test
        // test all video_details against resString
        let res = codecData.video_details.filter((str) => { return (resString.test(str)) })
        if (res && res.length > 0) {
            res = res[0]
            res = res.split('x')
        } else {
            console.log('RES IS NULL , ', res)
            return null
        }
        let width = parseInt(res[0])
        let height = parseInt(res[1])

        let s = parseInt(currentHeight)

        return String(Math.floor((width * s) / height) + 'x' + s)
    },
}
class EncoderService {
    events: any;
	statusInfo: any;
	self: any;
	jobOutput: any;
    constructor(self) {
        this.self = self;

        this.statusInfo = {};
        this.jobOutput = {};
        this.events = new EventEmitter();
    }
    async status(id) {
        return this.statusInfo[id];
    }
    getJobOutput(jobId) {
        return new Promise((resolve, reject) => {
            if(this.jobOutput[jobId]) {
                return resolve(this.jobOutput[jobId])
            } else {
                this.events.once(`complete.${jobId}`, (error, output) => {
                    if(error) return reject(error);
                    return resolve(output)
                })
            }
        })
    }
    async executeJob(jobInfo) {
        const workfolder = tmp.dirSync().name;
        var command = ffmpeg(jobInfo.sourceUrl);
        this.statusInfo[jobInfo.id] = {
            progress: {},
            stage: 0,
            nstages: jobInfo.profiles.length
        };

        var codec = await new Promise((resolve, reject) => ffmpeg.getAvailableEncoders(async (e, enc) => {
            if (jobInfo.options.hwaccel !== null || jobInfo.options.hwaccel !== "none") {
                for (var key of Object.keys(enc)) {
                    if (key.includes(`h264_${jobInfo.options.hwaccel}`)) {
                        return resolve(key)
                    }
                }
            }
            return resolve("libx264");
        }))
        command.videoCodec(codec);
        command.audioCodec("aac")
        command.audioBitrate('256k')

        command.addOption('-hls_time', 5)
        // include all the segments in the list
        .addOption('-hls_list_size', 0)
        .addOption('-segment_time', 10)
        .addOption('-f', 'segment')
        //command.output(path.join(workfolder, "480p/index.m3u8")).outputFormat("hls")


        
        let sizes = []
        let codecData;
        let duration;
        for (var profile of jobInfo.profiles) {
            var ret = command.clone();
            sizes.push(profile.size);
            ret.size(profile.size);
            ret.on('progress', ((progress) => {
                this.events.emit("progress", jobInfo.id, progress)
                console.log(progress)
                this.statusInfo[jobInfo.id].progress = progress;
            }).bind(this))
            ret.on('end', () => {
                this.events.emit('done', jobInfo.id)
                //this.statusInfo[jobInfo.id].done = true;
                delete this.statusInfo[jobInfo.id].progress;
            })
            var promy = new Promise<void>((resolve, reject) => {
                ret.on('end', () => {
                    resolve();
                }).on('error', (err) => {
                    reject(err)
                }).on('codecData', (data) => {
                    codecData = data;
                    duration = codecData.duration;
                })
            })
            ret.videoBitrate(MAX_BIT_RATE[String(profile.size.split('x')[1])])
            fs.mkdirSync(path.join(workfolder, `${String(profile.size.split('x')[1])}p`))
            //ret.save(path.join(workfolder, `${String(size.split('x')[1])}p`, 'index.m3u8'))
            console.log(path.join(workfolder, `${String(profile.size.split('x')[1])}p`, 'index.m3u8'))
            ret.addOption(`-segment_format`, "mpegts")
            ret.addOption('-segment_list', path.join(workfolder, `${String(profile.size.split('x')[1])}p`, 'index.m3u8'))
            ret.save(path.join(workfolder + '/' + `${String(profile.size.split('x')[1])}p`, `${String(profile.size.split('x')[1])}p_%d.ts`))
            await promy;

            this.statusInfo[jobInfo.id].stage += 1;
        }

        var manifest = this.generateManifest(codecData, sizes)
        fs.writeFileSync(path.join(workfolder, "manifest.m3u8"), manifest)
        var ipfsHash = await this.self.ipfs.add(globSource(workfolder, {recursive:true}), {pin:false})
        console.log(JSON.stringify(ipfsHash))
        var output = {
            ipfsHash: ipfsHash.cid.toString(),
            size: ipfsHash.size,
            playUrl: path.join(ipfsHash.cid.toString(), "manifest.m3u8"),
            folderPath: workfolder,
            duration,
            path: "manifest.m3u8"
        }
        this.events.emit(`complete.${jobInfo.id}`, null, output)
        return output
    }
    getScreenshot(path) {
        return new Promise((resolve, reject) => {
            const workfolder = tmp.dirSync();
            var screenshotPath;
            ffmpeg(path)
                .on('filenames', function (filenames) {
                    console.log(filenames)
                    console.log('Will generate ' + filenames.join(', '))
                    screenshotPath = path.join(workfolder, filenames[0])
                })
                .on('end', function () {
                    console.log('Screenshots taken');
                    return resolve(screenshotPath);
                })
                .screenshots({
                    // Will take screens at 20%, 40%, 60% and 80% of the video
                    timestamps: [Math.floor(Math.random() * 100) + 1 + '%'],
                    count: 1,
                    folder: workfolder
                });
        })
    }
    /**
     * generate the master manifest for the transcoded video.
     * @return {Promise<String>}      generated Manifest string.
     */
    generateManifest(codecData, sizes) {
        let master = '#EXTM3U\n'
        master += '#EXT-X-VERSION:6\n'
        let resolutionLine = (size) => {
            return `#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=${tutils.getBandwidth(tutils.getHeight(size))},CODECS="avc1.4d001f,mp4a.40.2",RESOLUTION=${tutils.calculateWidth(codecData, tutils.getHeight(size))},NAME=${tutils.getHeight(size)}\n`
        }
        let result = master
        console.log('availableSizes: ', sizes)
        sizes.forEach((size) => {
            // log(`format: ${JSON.stringify(formats[size])} , size: ${size}`)
            result += resolutionLine(size)
            result += String(size.split('x')[1]) + 'p/index.m3u8\n'
        })

        return result;
    }
    async createJob(jobInfo) {
        if (jobInfo.id) {
            jobInfo.id == uuidv4();
        }
        this.executeJob(jobInfo);
        return jobInfo;
    }
}
export default EncoderService