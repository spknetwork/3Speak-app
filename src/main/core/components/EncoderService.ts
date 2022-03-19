import { CoreService } from '..'
import { EncodingOutput, VideoEncodingJob, VideoInfo } from '../../../common/models/video.model'
import tmp from 'tmp'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import { uuidv4 } from 'uuid'
import { globSource } from 'ipfs-http-client'
import { EventEmitter } from 'events'
//import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg'
import { GetFfmpegPath } from '../ffmpeg_helper'

if (process.env.NODE_ENV === 'development') {
  //ffmpeg.setFfmpegPath(ffmpegPath)
} else {
  try {
    ffmpeg.setFfmpegPath(GetFfmpegPath())
  } catch (ex) {
    console.error(`Error getting ffmpeg path for production`)
  }
}

const MAX_BIT_RATE = {
  '1080': '2760k',
  '720': '1327k',
  '480': '763k',
  '360': '423k',
  '240': '155k',
  '144': '640k',
}
class tutils {
  /**
   * get an array of possible downsampled bitrates
   * @param  {number} height Video height, grabbed from ffmpeg probe
   * @return {array}        Array of possible downsample sizes.
   */
  static getPossibleBitrates(height) {
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
  }

  static getBandwidth(height) {
    if (!height) {
      return null
    }

    // default to the lowest height. in case the video is smaller than that.
    return MAX_BIT_RATE[String(height)] || MAX_BIT_RATE['144']
  }

  /**
   * get video height from size String
   * @param  {String} size string from ffmpeg @example '?x720'
   * @return {number}      height integer.
   */
  static getHeight(size: string) {
    return parseInt(size.split('x')[1])
  }

  static calculateWidth(codecData, currentHeight) {
    const resString = /^\d{3,}x\d{3,}/g // test
    // test all video_details against resString
    let res = codecData.video_details.filter((str) => {
      return resString.test(str)
    })
    if (res && res.length > 0) {
      res = res[0]
      res = res.split('x')
    } else {
      return null
    }
    const width = parseInt(res[0])
    const height = parseInt(res[1])

    const s = parseInt(currentHeight)

    return String(Math.floor((width * s) / height) + 'x' + s)
  }
}

export class EncoderService {
  events: any
  statusInfo: any
  self: CoreService
  jobOutput: any
  constructor(self: CoreService) {
    this.self = self

    this.statusInfo = {}
    this.jobOutput = {}
    this.events = new EventEmitter()
  }
  async status(id) {
    return this.statusInfo[id]
  }
  getJobOutput(jobId) {
    return new Promise((resolve, reject) => {
      if (this.jobOutput[jobId]) {
        return resolve(this.jobOutput[jobId])
      } else {
        this.events.once(`complete.${jobId}`, (error, output) => {
          if (error) return reject(error)
          return resolve(output)
        })
      }
    })
  }

  get logger() {
    return this.self.logger
  }

  async executeJob(jobInfo: VideoEncodingJob): Promise<EncodingOutput> {
    this.logger.info(`Executing encoding job...`)
    this.logger.info(`job info: ${JSON.stringify(jobInfo, null, 2)}`)

    const workfolder = tmp.dirSync().name as string

    this.logger.info(`workfolder: ${workfolder}`)
    const command = ffmpeg(jobInfo.sourceUrl)
    this.statusInfo[jobInfo.id] = {
      progress: {},
      stage: 0,
      nstages: jobInfo.profiles.length,
    }

    this.logger.info('got ffmpeg command')

    const codec = await new Promise((resolve, reject) =>
      ffmpeg.getAvailableEncoders(async (e, enc) => {
        if (jobInfo.options.hwaccel !== null || jobInfo.options.hwaccel !== 'none') {
          for (const key of Object.keys(enc)) {
            if (key.includes(`h264_${jobInfo.options.hwaccel}`)) {
              return resolve(key)
            }
          }
        }
        return resolve('libx264')
      }),
    )
    this.logger.info(`Using video codec ${codec}`)
    command.videoCodec(codec)
    command.audioCodec('aac')
    command.audioBitrate('256k')

    command
      .addOption('-hls_time', 5)
      // include all the segments in the list
      .addOption('-hls_list_size', 0)
      .addOption('-segment_time', 10)
      .addOption('-f', 'segment')
    //command.output(path.join(workfolder, "480p/index.m3u8")).outputFormat("hls")

    const sizes = []
    let codecData
    let duration
    this.logger.info(`Processing profiles`)
    for (const profile of jobInfo.profiles) {
      const ret = command.clone()
      sizes.push(profile.size)
      ret.size(profile.size)
      this.logger.info(`Profile size ${profile.size}`)
      ret.on(
        'progress',
        ((progress) => {
          this.events.emit('progress', jobInfo.id, progress)
          this.statusInfo[jobInfo.id].progress = progress
        }).bind(this),
      )
      ret.on('end', () => {
        this.events.emit('done', jobInfo.id)
        //this.statusInfo[jobInfo.id].done = true;
        delete this.statusInfo[jobInfo.id].progress
      })
      const promy = new Promise<void>((resolve, reject) => {
        ret
          .on('end', () => {
            resolve()
          })
          .on('error', (err) => {
            reject(err)
          })
          .on('codecData', (data) => {
            codecData = data
            duration = codecData.duration
          })
      })
      ret.videoBitrate(MAX_BIT_RATE[String(profile.size.split('x')[1])])
      fs.mkdirSync(path.join(workfolder, `${String(profile.size.split('x')[1])}p`))
      //ret.save(path.join(workfolder, `${String(size.split('x')[1])}p`, 'index.m3u8'))
      ret.addOption(`-segment_format`, 'mpegts')
      ret.addOption(
        '-segment_list',
        path.join(workfolder, `${String(profile.size.split('x')[1])}p`, 'index.m3u8'),
      )
      ret.save(
        path.join(
          workfolder + '/' + `${String(profile.size.split('x')[1])}p`,
          `${String(profile.size.split('x')[1])}p_%d.ts`,
        ),
      )
      await promy

      this.statusInfo[jobInfo.id].stage += 1
    }

    const manifest = this.generateManifest(codecData, sizes)
    fs.writeFileSync(path.join(workfolder, 'manifest.m3u8'), manifest)

    this.logger.info(`Wrote manifest to ${workfolder}`)

    const ipfsHash = this.self.ipfs.addAll(globSource(workfolder, '**/*'), {
      pin: false,
    })

    //     for await (const file of globSource(workfolder, '**/*')) {
    //       this.logger.info(`Matched file path ${file.path}`)
    //       const ipfsHash = await this.self.ipfs.add(file, {
    //         pin: false,
    //       })

    //       //       this.logger.info(`Generated IPFS hash `)
    //       //       console.log(ipfsHash)

    //       output.push({
    //         ipfsHash: ipfsHash.cid.toString(),
    //         size: ipfsHash.size,
    //         playUrl: path.join(ipfsHash.cid.toString(), 'manifest.m3u8'),
    //         folderPath: workfolder,
    //         duration,
    //         path: 'manifest.m3u8',
    //       })
    //     }

    for await (const item of ipfsHash) {
      const output: EncodingOutput = {
        ipfsHash: item.cid.toString(),
        size: item.size,
        playUrl: path.join(item.cid.toString(), 'manifest.m3u8'),
        folderPath: workfolder,
        duration,
        path: 'manifest.m3u8' as any,
      }

      this.events.emit(`complete.${jobInfo.id}`, null, output)

      return output
    }
  }

  getScreenshot(path) {
    return new Promise((resolve, reject) => {
      const workfolder = tmp.dirSync()
      let screenshotPath
      ffmpeg(path)
        .on('filenames', function (filenames) {
          screenshotPath = path.join(workfolder, filenames[0])
        })
        .on('end', function () {
          return resolve(screenshotPath)
        })
        .screenshots({
          // Will take screens at 20%, 40%, 60% and 80% of the video
          timestamps: [Math.floor(Math.random() * 100) + 1 + '%'],
          count: 1,
          folder: workfolder,
        })
    })
  }
  /**
   * generate the master manifest for the transcoded video.
   * @return {Promise<String>}      generated Manifest string.
   */
  generateManifest(codecData, sizes) {
    let master = '#EXTM3U\n'
    master += '#EXT-X-VERSION:6\n'
    const resolutionLine = (size) => {
      return `#EXT-X-STREAM-INF:PROGRAM-ID=1,BANDWIDTH=${tutils.getBandwidth(
        tutils.getHeight(size),
      )},CODECS="avc1.4d001f,mp4a.40.2",RESOLUTION=${tutils.calculateWidth(
        codecData,
        tutils.getHeight(size),
      )},NAME=${tutils.getHeight(size)}\n`
    }
    let result = master
    sizes.forEach((size) => {
      // log(`format: ${JSON.stringify(formats[size])} , size: ${size}`)
      result += resolutionLine(size)
      result += String(size.split('x')[1]) + 'p/index.m3u8\n'
    })

    return result
  }

  createJob(job: VideoEncodingJob): VideoEncodingJob {
    if (job.id) {
      job.id == uuidv4()
    }
    void this.executeJob(job)
    return job
  }

  async ready(): Promise<boolean> {
    return true
  }
}
