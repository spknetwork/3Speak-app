/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import RefLink from '../../main/RefLink'
import PromiseIpc from 'electron-promise-ipc'
import { Container } from 'react-bootstrap'
import { Finder } from 'arraysearch'
import DefaultThumbnail from '../assets/img/default-thumbnail.jpg'
import { GridFeedQueryService } from './GridFeed/grid-feed-query.service'
import { knex } from '../singletons/knex.singleton'
import { VideoWidget } from '../components/video/VideoWidget'
import { useNewFeed } from '../components/hooks/Feeds'

export interface GridFeedProps {
  source?: 'hive'
  awaitingMoreData?: boolean
  type: string
  data?: any[]
  titleText?: string
}

export interface GridFeedState {
  data: any[]
  awaitingMoreData: boolean
  reflink: RefLink
  offset: number
}

export function GridFeedView(props: GridFeedProps) {
  const [data, setData] = useState([])
  const [awaitingMoreData, setAwaitingMoreData] = useState(false)

  const videos = useNewFeed()
  console.log(videos)
  const reflink = useMemo(() => {
    return RefLink.parse(props.source || 'hive')
  }, [props.source])

  const [offset, setOffset] = useState(0)

  const handleScroll = useCallback(async () => {
    if (!awaitingMoreData) {
      const windowHeight =
        'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight
      const body = document.body
      const html = document.documentElement
      const docHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight,
      )
      const windowBottom = windowHeight + window.pageYOffset
      if (windowBottom + 200 >= docHeight) {
        setAwaitingMoreData(true)
        switch (reflink.source.value) {
          case 'hive': {
            //For now use the 3speak.tv API until a proper solution is devised
            if (props.type === 'home') {
              void fetch(`https://3speak.tv/api/trends/more?skip=${data.length}`)
                .then((res) => res.json())
                .then(async (json) => {
                  json = json.recommended ? json.recommended : json.trends
                  json.forEach((video) => {
                    video['author'] = video['owner']
                    delete video['owner']
                  })
                  json = data.concat(json)
                  json = json.filter((video, index, self) => {
                    return (
                      index ===
                      self.findIndex((v) => {
                        if (v) {
                          return v.author === video.author && v.permlink === video.permlink
                        }
                      })
                    )
                  })
                  for (const e in json) {
                    if (
                      await PromiseIpc.send(
                        'blocklist.has',
                        `hive:${json[e].author}:${json[e].permlink}` as any,
                      )
                    ) {
                      delete json[e]
                    }
                  }

                  setData(json)
                  setAwaitingMoreData(false)
                })
              return
            }

            const querySql = GridFeedQueryService.getFeedSql(props.type, offset)
            const query = knex.raw(querySql)

            query.on('query-response', (ret, det, aet) => {
              //       console.log(ret, det, aet)
            })
            const blob = data
            query
              .stream()
              .on('data', async (val) => {
                if (
                  await PromiseIpc.send(
                    'blocklist.has',
                    `hive:${val.author}:${val.permlink}` as any,
                  )
                ) {
                  console.log(`${val.author} is blocked`)
                  //return;
                }
                val.json_metadata = JSON.parse(val.json_metadata)
                //console.log(val)
                if (
                  !(await PromiseIpc.send(
                    'blocklist.has',
                    `hive:${val.author}:${val.permlink}` as any,
                  ))
                ) {
                  //console.log(val)
                  if (!val.json_metadata.video) {
                    val.json_metadata.video = {
                      info: {},
                    }
                  } else if (!val.json_metadata.video.info) {
                    val.json_metadata.video.info = {}
                  }
                  let thumbnail
                  if (val.json_metadata.sourceMap) {
                    const thumbnailOut = Finder.one
                      .in(val.json_metadata.sourceMap)
                      .with({ type: 'thumbnail' })
                    if (thumbnailOut) {
                      thumbnail = thumbnailOut.url
                    } else {
                      thumbnail = DefaultThumbnail
                    }
                    thumbnail = val.three_video.thumbnmail_url
                    console.log(thumbnail)
                  }
                  console.log(val.json_metadata.sourceMap)
                  console.log(val)
                  blob.push({
                    created: val.created,
                    author: val.author,
                    permlink: val.permlink,
                    tags: val.json_metadata.tags,
                    title: val.title,
                    duration:
                      val.json_metadata.video.info.duration || val.json_metadata.video.duration,
                    isIpfs: val.json_metadata.video.info.ipfs || thumbnail ? true : false,
                    ipfs: val.json_metadata.video.info.ipfs,
                    images: {
                      ipfs_thumbnail: thumbnail
                        ? `/ipfs/${thumbnail.slice(7)}`
                        : `/ipfs/${val.json_metadata.video.info.ipfsThumbnail}`,
                      thumbnail: `https://threespeakvideo.b-cdn.net/${val.permlink}/thumbnails/default.png`,
                      poster: `https://threespeakvideo.b-cdn.net/${val.permlink}/poster.png`,
                      post: `https://threespeakvideo.b-cdn.net/${val.permlink}/post.png`,
                    },
                    views: val.total_vote_weight
                      ? Math.log(val.total_vote_weight / 1000).toFixed(2)
                      : 0,
                  })
                }
                setOffset(offset + 1)
                setData(blob)
              })
              .on('end', () => {
                setAwaitingMoreData(false)
              })
            break
          }
          default: {
            throw new Error(`Unrecognized feed type: ${reflink.source.value}`)
          }
        }
      }
    }
  }, [])

  // init tasks
  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const retrieveData = useCallback(async () => {
    //For now use the 3speak.tv API until a proper solution is devised
    if (
      props.type === 'home' ||
      props.type === 'trending' ||
      props.type === 'new' ||
      props.type === 'firstUploads'
    ) {
      void fetch(`https://3speak.tv/apiv2/feeds/${props.type}`)
        .then((res) => res.json())
        .then(async (json) => {
          for (const e in json) {
            if (
              await PromiseIpc.send(
                'blocklist.has',
                `hive:${json[e].author}:${json[e].permlink}` as any,
              )
            ) {
              delete json[e]
            }
          }
          setData(json)
        })
      return
    }

    //     let query
    const querySql = GridFeedQueryService.getFeedSql(props.type)
    const query = knex.raw(querySql)

    const blob = []
    query.stream().on('data', async (val) => {
      if (await PromiseIpc.send('blocklist.has', `hive:${val.author}:${val.permlink}` as any)) {
        console.log(`${val.author} is blocked`)
        return
      }
      val.json_metadata = JSON.parse(val.json_metadata)

      if (!val.json_metadata.video) {
        val.json_metadata.video = {
          info: {},
        }
      } else if (!val.json_metadata.video.info) {
        val.json_metadata.video.info = {}
      }
      let thumbnail
      if (val.json_metadata.sourceMap) {
        const thumbnailOut = Finder.one.in(val.json_metadata.sourceMap).with({ type: 'thumbnail' })
        if (thumbnailOut) {
          thumbnail = thumbnailOut.url
        } else {
          thumbnail = DefaultThumbnail
        }
      }

      try {
        blob.push({
          created: val.created,
          author: val.author,
          permlink: val.permlink,
          tags: val.json_metadata.tags,
          title: val.title,
          duration: val.json_metadata.video.info.duration || val.json_metadata.video.duration,
          isIpfs: val.json_metadata.video.info.ipfs || thumbnail ? true : false,
          ipfs: val.json_metadata.video.info.ipfs,
          images: {
            ipfs_thumbnail: thumbnail
              ? `/ipfs/${thumbnail.slice(7)}`
              : `/ipfs/${val.json_metadata.video.info.ipfsThumbnail}`,
            thumbnail: `https://threespeakvideo.b-cdn.net/${val.permlink}/thumbnails/default.png`,
            poster: `https://threespeakvideo.b-cdn.net/${val.permlink}/poster.png`,
            post: `https://threespeakvideo.b-cdn.net/${val.permlink}/post.png`,
          },
          views: val.total_vote_weight ? Math.log(val.total_vote_weight / 1000).toFixed(2) : 0,
        })
        // console.log(blob[blob.length - 1])
      } catch (ex) {
        console.error(`hive:${val.author}:${val.permlink} is bugged the fuck out`)
        console.error(val.json_metadata.video)
        console.error(ex)
      }
      setData(blob)
      setOffset(25)
    })

    query
      .then((rows) => {
        for (const val of rows) {
          val.json_metadata = JSON.parse(val.json_metadata)
        }
      })
      .catch((err) => {
        console.error(`Error connecting to hivesql!`)
        console.error(err)
        throw err
      })
      .finally(() => {})

    switch (reflink.source.value) {
      case 'hive': {
        void fetch(`https://3speak.tv/apiv2/feeds/${props.type}`)
          .then((res) => res.json())
          .then(async (json) => {
            for (const e in json) {
              if (
                await PromiseIpc.send(
                  'blocklist.has',
                  `hive:${json[e].author}:${json[e].permlink}` as any,
                )
              ) {
                delete json[e]
              }
            }
          })
        break
      }
      default: {
        throw new Error(`Unrecognized feed type ${reflink.source.value}`)
      }
    }
  }, [])

  useEffect(() => {
    if (props.data) {
      setData(props.data)
    } else {
      setData([])
      void retrieveData()
    }
    window.scrollTo(0, 0)
  }, [props.type, props.data])

  return (
    <div>
      {props.titleText !== undefined ? (
        <div className="header_sec">
          <Container fluid className="header_sec">
            <div className="row">
              <div className="col-lg-6 col-md-6 col-xs-12 header_dist1">
                <h1 className="white_col">{props.titleText}</h1>
              </div>
            </div>
          </Container>
        </div>
      ) : null}
      <section className="content_home">
        <div className={'row'}>
          {videos.map((el) => (
            <VideoWidget
              key={el.author + '/' + el.permlink}
              reflink={`hive:${el.author}:${el.permlink}`}
              {...el}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
