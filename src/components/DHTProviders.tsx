import React, { useState, useEffect } from 'react';
import { FaSitemap } from 'react-icons/fa';
import * as IPFSHTTPClient from 'ipfs-http-client';
import { IPFS_HOST } from '../common/constants';

let ipfsClient;
try {
  ipfsClient = IPFSHTTPClient.create({ url: IPFS_HOST });
} catch (error) {
  console.error(`Error creating IPFS client in watch.tsx: `, error);
  throw error;
}

export function DHTProviders(props) {
  const [peers, setPeers] = useState<string | number>('N/A');

  useEffect(() => {
    void load();

    async function load() {
      if (!props.rootCid) {
        return;
      }
      let out = 0;
      for await (const pov of ipfsClient.dht.findProvs(props.rootCid)) {
        out = out + 1;
        setPeers(out);
      }
      setPeers(out);
    }
  }, []);

  return (
    <div>
      <FaSitemap /> Storage Servers: <strong>{peers}</strong>
    </div>
  );
}
