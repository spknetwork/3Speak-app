import './Uploader.css'
import * as IPFSHTTPClient from 'ipfs-http-client'
import React, { useEffect, useRef, useState } from 'react'


import { IPFS_HOST } from '../../common/constants'
import LoadingMessage from '../components/LoadingMessage'
import UploaderViewContent from './UploaderView/uploaderViewContent'
import { calculatePercentage } from './UploaderView/calculatePercentage';
import { normalizeSize } from './UploaderView/normalizeSize';
import { publish } from './UploaderView/publish';
import { videoSelect } from './UploaderView/videoSelect';
import { thumbnailSelect } from './UploaderView/thumbnailSelect'
import { startEncode } from './UploaderView/startEncode';
export function UploaderView() {
  const videoUpload = useRef<any>()
  const thumbnailUpload = useRef<any>()
  const thumbnailPreview = useRef('')
  // const publishForm = useRef()
  const [publishFormTitle, setPublishFormTitle] = useState('')
  const [publishFormDescription, setPublishFormDescription] = useState('')
  const [publishFormTags, setPublishFormTags] = useState('')

  // const hwaccelOption = useRef()
  const ipfs = useRef<any>()

  const [logData, setLogData] = useState([])
  const [hwaccelOption, setHwaccelOption] = useState('')

  const [videoSourceFile, setVideoSourceFile] = useState()
  const [encodingInProgress, setEncodingInProgress] = useState(false)
  const [progress, setProgress] = useState<any>({})
  const [statusInfo, setStatusInfo] = useState<any>({ progress: {} })
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState('')
  const [videoInfo, setVideoInfo] = useState<any>({
    path: null,
    size: 0,
    cid: null,
    language: '',
    duration: null,
  })
  const [thumbnailInfo, setThumbnailInfo] = useState({
    path: null,
    size: 0,
    cid: null,
  })
  const [startTime, setStartTime] = useState<number>()
  const [endTime, setEndTime] = useState<number>(0)
  const [publishReady, setPublishReady] = useState(false)
  const [blockedGlobalMessage, setBlockedGlobalMessage] = useState('')

  useEffect(() => {
    ipfs.current = IPFSHTTPClient.create({ host: IPFS_HOST })
  }, [])

  const handlePublish = async () => {
    await publish({
      videoInfo, thumbnailInfo, publishFormTitle, publishFormDescription, publishFormTags, setBlockedGlobalMessage, ipfs,
    });
  };

  const handleVideoSelect = (e) => {
    videoSelect(
      e, setVideoSourceFile, setLogData, logData, videoInfo
    );
  };

  const handleThumbnailSelect = async (e) => {
    await thumbnailSelect({
      e, thumbnailPreview, setThumbnailInfo, setVideoSourceFile, setLogData, ipfs, logData, videoInfo
    });
  };
  
  const handleStartEncode = async () => {
    await startEncode({
      event, videoSourceFile, hwaccelOption, setEncodingInProgress, setStartTime, setEndTime, setProgress, setStatusInfo, setEstimatedTimeRemaining, setVideoInfo, setPublishReady, progress, statusInfo
    });
  };




  if (blockedGlobalMessage) {
    return (
      <LoadingMessage
        loadingMessage={blockedGlobalMessage}
        subtitle="Note: you will need to keep the app open for your video to play for other users. A process called 'shunting' will be released in the future to relieve this issue."
      />
    )
  }

  return (
    <UploaderViewContent
      videoSourceFile={videoSourceFile}
      videoUpload={videoUpload}
      handleVideoSelect={handleVideoSelect}
      setPublishFormTitle={setPublishFormTitle}
      publishFormTitle={publishFormTitle}
      setPublishFormDescription={setPublishFormDescription}
      publishFormDescription={publishFormDescription}
      setPublishFormTags={setPublishFormTags}
      publishFormTags={publishFormTags}
      thumbnailPreview={thumbnailPreview}
      thumbnailUpload={thumbnailUpload}
      progress={progress}
      handleThumbnailSelect={handleThumbnailSelect}
      handleStartEncode={handleStartEncode}
      publish={handlePublish}
      encodingInProgress={encodingInProgress}
      publishReady={publishReady}
      normalizeSize={normalizeSize}
      calculatePercentage={calculatePercentage}
      estimatedTimeRemaining={estimatedTimeRemaining}
      endTime={endTime}
      startTime={startTime}
      hwaccelOption={hwaccelOption}
      setHwaccelOption={setHwaccelOption}
      videoInfo={videoInfo}
      thumbnailInfo={thumbnailInfo}
      logData={logData}
      statusInfo={statusInfo}
    />
  )
}
