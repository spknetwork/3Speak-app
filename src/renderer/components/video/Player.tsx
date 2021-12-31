import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactJWPlayer from 'react-jw-player'
import mergeOptions from 'merge-options'
import PromiseIpc from 'electron-promise-ipc'
import CID from 'cids'
import convert from 'convert-units'
import { VideoInfo } from '../../../common/models/video.model'
import { AccountService } from '../../services/account.service'
import { VideoService } from '../../services/video.service'

interface PlayerProps {
  videoInfo?: VideoInfo
  reflink: any
  match?: any
  options?: any
}

export function Player(props: PlayerProps) {
  const [playerId] = useState(Math.random().toString())
  const [videoInfo, setVideoInfo] = useState(undefined as VideoInfo)
  const [videoUrl, setVideoUrl] = useState('')
  const [thumbnail, setThumbnail] = useState()
  const playerRef = useRef()

  useEffect(() => {
    void load()

    async function load() {
      let reflink

      if (props.reflink) {
        reflink = props.reflink
      } else {
        reflink = props.match.params.reflink
      }

      const defaultOptions = {
        ipfsGateway: 'https://ipfs.io',
      }

      let options
      if (props.options) {
        options = mergeOptions(defaultOptions, props.options)
      } else {
        options = defaultOptions
      }

      let vidInfo
      if (props.videoInfo) {
        vidInfo = props.videoInfo
      } else if (reflink) {
        vidInfo = await AccountService.permalinkToVideoInfo(reflink)
      } else {
        throw new Error('Cannot set video info!')
      }
      const vidurl = await VideoService.getVideoSourceURL(vidInfo)
      setThumbnail(await VideoService.getThumbnailURL(vidInfo))
      setVideoUrl(vidurl)
      setVideoInfo(vidInfo)
    }
  }, [])

  const onPlay = useCallback(async () => {
    console.log(`ONPLAY video`)
    if (!videoInfo) {
      throw new Error(`Cannot play video - videoInfo is not defined`)
    }

    const cids = []
    console.log(videoInfo.sources)

    for (const source of videoInfo.sources) {
      try {
        const url = new URL(source.url)
        new CID(url.host)
        cids.push(url.host)
      } catch (err) {
        console.error(`Error creating CID for video URL ${source.url}`)
      }
    }
    console.log(`CIDs to cache ${JSON.stringify(cids)}`)

    if (cids.length !== 0) {
      await PromiseIpc.send('pins.add', {
        _id: props.reflink,
        source: 'Watch Page',
        cids,
        expire: new Date().getTime() + convert('10').from('d').to('ms'),
        meta: {
          title: videoInfo.title,
        },
      } as any)
    }
  }, [videoInfo])

  return (
    <>
      {videoUrl ? (
        <ReactJWPlayer
          licenseKey="64HPbvSQorQcd52B8XFuhMtEoitbvY/EXJmMBfKcXZQU2Rnn"
          customProps={{ playbackRateControls: true, autostart: false }}
          file={videoUrl}
          onPlay={onPlay}
          image={thumbnail}
          id="botr_UVQWMA4o_kGWxh33Q_div"
          playerId={playerId}
          ref={playerRef}
          playerScript="https://cdn.jwplayer.com/libraries/HT7Dts3H.js"
        ></ReactJWPlayer>
      ) : (
        <div style={{ textAlign: 'center' }}>[Player] videoInfo not specified [Player]</div>
      )}
    </>
  )
}
