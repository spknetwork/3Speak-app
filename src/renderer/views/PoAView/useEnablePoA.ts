import { useState, useEffect } from 'react';
import { AccountService } from '../../services/account.service';
import { handleUpdatePostingData } from '../../services/peer.service';
import { create } from 'ipfs-http-client';
import ArraySearch from 'arraysearch';
import { NotificationManager } from 'react-notifications';

const Finder = ArraySearch.Finder;

export function useEnablePoA() {
  const [ipfsPeerID, setIpfsPeerID] = useState('');
  const [alreadyEnabled, setAlreadyEnabled] = useState(false);
  const getIpfsConfig = async () => {
    try {
      const ipfs = create({ url: 'http://localhost:5001' });
      const { id } = await ipfs.id();
      console.log('peerId', id);

      setIpfsPeerID(id);
    } catch (error) {
      console.error('Error getting IPFS peer ID:', error);
    }
  };

  const loadAlreadyEnabled = async () => {
    const out = await AccountService.getAccountMetadata();
    const parsedOut = JSON.parse(out);
    if (parsedOut.peerId) {
      setAlreadyEnabled(true);
    } else {
      console.log(out);
      console.log('Proof of access is not enabled');
      setAlreadyEnabled(false);
    }
  };

  const enablePoA = async () => {
    const profileID = localStorage.getItem('SNProfileID');
    if (profileID) {
      try {
        let out = await AccountService.getAccountMetadata();
        const parsedOut = JSON.parse(out);

        if (parsedOut.peerId) {
          console.log('Proof of access is already enabled');
          NotificationManager.error('Proof of access is already enabled');
          return;
        }

        console.log('peerID: ', ipfsPeerID);
        await handleUpdatePostingData(ipfsPeerID);
        NotificationManager.success('Proof of access enabled');
      } catch (error) {
        console.error(error);
        NotificationManager.error('There was an error completing this operation');
      }
    } else {
      NotificationManager.error('You need to be logged in to perform this operation');
    }
  };

  useEffect(() => {
    void getIpfsConfig();
  }, []);

  return {
    ipfsPeerID,
    alreadyEnabled,
    enablePoA,
    loadAlreadyEnabled,
  };
}
