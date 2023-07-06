import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, FormControl } from 'react-bootstrap';
import { IpfsHandler } from '../../../main/core/components/ipfsHandler';
import { AccountService } from '../../services/account.service';
import { FormUtils } from '../../renderer_utils';
import { NotificationManager } from 'react-notifications';
import Popup from 'react-popup';
import CID from 'cids';
import PromiseIpc from 'electron-promise-ipc';

export const usePinningUtils = () => {
  const [newVideos, setNewVideos] = useState([]);
  const [trendingVideos, setTrendingVideos] = useState([]);
  const [pinList, setPinList] = useState([]);
  const pid = useRef(null);

  const updateSearchTables = async (community = null, creator = null) => {
    const ids = pinList.map((x) => x._id);
    console.log('ids', ids);
    const params = '?limit=10&ipfsOnly=true';
    let newUrl = `https://3speak.tv/apiv2/feeds/new${params}`;
    let trendingUrl = `https://3speak.tv/apiv2/feeds/trending${params}`;

    if (community) {
      newUrl = `https://3speak.tv/apiv2/feeds/community/${community}/new${params}`;
      trendingUrl = `https://3speak.tv/apiv2/feeds/community/${community}/trending${params}`;
    } else if (creator && creator.length > 2) {
      newUrl = `https://3speak.tv/apiv2/feeds/@${creator}`;
      trendingUrl = null;
    }

    try {
      const newResponse = await fetch(newUrl);
      const newVideos = await newResponse.json();
      newVideos.forEach((video) => {
        const id = `hive:${video.author}:${video.permlink}`;
        video.isPinned = ids.includes(id);
        video.id = id;
      });
      setNewVideos(newVideos);

      if (trendingUrl) {
        const trendingResponse = await fetch(trendingUrl);
        const trendingVideos = await trendingResponse.json();
        trendingVideos.forEach((video) => {
          const id = `hive:${video.author}:${video.permlink}`;
          video.isPinned = ids.includes(id);
          video.id = id;
        });
        setTrendingVideos(trendingVideos);
      } else {
        setTrendingVideos([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const generate = async () => {
    // type error - 2 arguments expected
    setPinList(await PromiseIpc.send('pins.ls', undefined as any))
  }
  const PinLocally = async (cids, title, _id) => {
    if (cids.length !== 0) {
      NotificationManager.info('Pinning in progress');

      try {
        await PromiseIpc.send('pins.add', {
          _id,
          source: 'Pins page',
          cids,
          expire: null,
          meta: {
            title,
          },
        });

        NotificationManager.success(
          `Video with title of ${title} has been successfully pinned! Thank you for contributing!`,
          'Pin Successful',
        );
      } catch (error) {
        console.error('Error pinning video:', error);
        NotificationManager.error('Error pinning video', 'Pin Failed');
      }
    } else {
      NotificationManager.warning('This video is not available on IPFS');
    }
    await generate();
  };
  const getReflinkFromPopup = () => new Promise(async (resolve) => {
    const ref = React.createRef() as any
    Popup.create({
      content: (
        <div>
          <Form ref={ref}>
          <Form.Label>Reflink</Form.Label>
          <FormControl
      name="reflink"
      placeholder="hive:username:123permlink"
      ></FormControl>
      </Form>
      </div>
    ),
      buttons: {
      left: [
        {
          text: 'Cancel',
          className: 'secondary',
          action: () => Popup.close(),
        },
      ],
        right: [
        {
          text: 'Done',
          className: 'success',
          action: () => {
            resolve(FormUtils.formToObj(new FormData(ref.current)));
            Popup.close();
          },
        },
      ],
    },
  });
  });
  const handleCase1 = async () => {
    const ret = (await getReflinkFromPopup()) as any;
    const video_info = await AccountService.permalinkToVideoInfo(ret.reflink);
    const cids = video_info.sources
      .map((source) => new (require('url').URL)(source.url))
      .filter((url) => {
        try {
          new CID(url.host);
          return true;
        } catch (ex) {
          console.error(ex);
          return false;
        }
      })
      .map((url) => url.host);

    if (cids.length !== 0) {
      NotificationManager.info('Pinning in progress');
      await PromiseIpc.send('pins.add', {
        _id: ret.reflink,
        source: 'Manual Add',
        cids,
        expire: null,
        meta: {
          title: video_info.title,
        },
      } as any);
      NotificationManager.success(
        `Video with reflink of ${ret.reflink} has been successfully pinned! Thank you for contributing!`,
        'Pin Successful',
      );
    } else {
      NotificationManager.warning('This video is not available on IPFS');
    }
  };
  const handleCase2 = async () => {
    NotificationManager.info('GC has started');
    const { ipfs } = await IpfsHandler.getIpfs();
    ipfs.repo.gc();
  };

   const actionSelect = async (key) => {
    switch (key) {
      case '1':
        await handleCase1();
        break;
      case '2':
        await handleCase2();
        break;
      default:
    }
  };
   const removePin = async (reflink) => {
    try {
      await PromiseIpc.send('pins.rm', reflink)
      NotificationManager.success('IPFS pin removal complete')
      await generate()
    } catch (ex) {
      NotificationManager.error('IPFS pin removal resulted in error')
      console.error(ex)
    }
  }

  useEffect(() => {
    document.title = '3Speak - Tokenised video communities';
    generate();
    pid.current = setInterval(generate, 40000);
    updateSearchTables();

    return () => {
      clearInterval(pid.current);
    };
  }, []);
  return {
    newVideos,
    trendingVideos,
    pinList,
    updateSearchTables,
    PinLocally,
    actionSelect,
    removePin,
  };
};

