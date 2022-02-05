export interface VideoSource {
  video?: {
    format: 'mp4' | 'hls' | 'webm'
    url: string
  }
  thumbnail?: string //Full URL can be IPFS URL or http
  type?: 'thumbnail' | 'video'
  url?: string
  format?: string
}

export interface VideoInfo {
  sources: VideoSource[]
  title: string
  description: string
  duration?: number
  creation: string
  tags: string[]
  refs: string[]
  meta: any
  reflink: string
}

export interface VideoResolutionProfile {
  name: string
  size: string
}

export interface VideoEncodingOptions {
  hwaccel: any
}

export interface VideoEncodingJob {
  id: any
  sourceUrl: string
  profiles: VideoResolutionProfile[]
  options: VideoEncodingOptions
}

export interface EncodingOutput {
  ipfsHash: string
  size: number
  playUrl: string
  folderPath: string
  duration: number
  path: 'manifest.m3u8'
}
