import Fs from 'fs'
import PromiseIpc from 'electron-promise-ipc'
import { millisecondsAsString, secondsAsString } from '../../../common/utils/unit-conversion.functions'
import { NotificationManager } from 'react-notifications'
import { calculatePercentage } from './calculatePercentage'
import DateTime from 'date-and-time'
export const startEncode = async ({event, videoSourceFile, hwaccelOption, setEncodingInProgress, setStartTime, setEndTime, setProgress, setStatusInfo, setEstimatedTimeRemaining, setVideoInfo, setPublishReady, progress, statusInfo}) => {
  event.preventDefault()
  if (videoSourceFile === null) {
    NotificationManager.error('No video source file selected')
    return
  }
  if (!Fs.existsSync(videoSourceFile)) {
    NotificationManager.error('Source file does not exist')
    return
  }
  setEncodingInProgress(true)
  const _startingTime = new Date().getTime()
  setStartTime(_startingTime)
  setEndTime(null)

  const jobInfo = (await PromiseIpc.send('encoder.createJob', {
    sourceUrl: videoSourceFile,
    profiles: [
      {
        name: '1080p',
        size: '1920x1080',
      },
      {
        name: '720p',
        size: '1080x720',
      },
      {
        name: '480p',
        size: '720x480',
      },
    ],
    options: {
      hwaccel:
        hwaccelOption &&
        hwaccelOption.length > 0 &&
        hwaccelOption !== '' &&
        hwaccelOption &&
        hwaccelOption !== 'none'
          ? hwaccelOption
          : undefined,
    },
  } as any)) as any
  NotificationManager.success('Encoding Started.')

  let savePct = 0
  const progressTrack = async () => {
    const _timeNow = new Date().getTime()
    const status = (await PromiseIpc.send('encoder.status', jobInfo.id)) as any

    console.log(`Encoder status: `, status)

    setProgress(status.progress || {})
    setStatusInfo(status)

    const val = status.progress.percent
    // const diffPct = val - savePct
    // savePct = val
    // const pctPerSec = diffPct / 3
    // const totalTimeRemaining = (100 - val) / pctPerSec
    const totalTimeRemaining = (100 * (_timeNow - _startingTime)) / val
    setEstimatedTimeRemaining(millisecondsAsString(totalTimeRemaining))
    setEndTime(_timeNow)
  }

  const pid = setInterval(progressTrack, 3000)
  void progressTrack()

  const encodeOutput = (await PromiseIpc.send('encoder.getjoboutput', jobInfo.id)) as any
  console.log(`got encode output`)
  console.log(encodeOutput)

  setVideoInfo({
    size: encodeOutput.size,
    cid: encodeOutput.ipfsHash,
    path: encodeOutput.path,
    duration: Number(DateTime.parse(encodeOutput.duration, 'hh:mm:ss.SS', true)) / 1000,
  })

  clearInterval(pid)

  setEncodingInProgress(false)
  setEstimatedTimeRemaining(null)
  setEndTime(new Date().getTime())
  setPublishReady(true)

  NotificationManager.success('Encoding complete.')
};
