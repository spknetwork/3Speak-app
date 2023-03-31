import 'brace/mode/json';
import 'brace/theme/github';
import 'brace/theme/monokai';
import 'brace/theme/solarized_dark';
import 'jsoneditor-react/es/editor.min.css';
import PoAInstaller from '../../main/AutoUpdaterPoA';
import { Terminal } from 'xterm';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { NotificationManager } from 'react-notifications';

import { AccountService } from '../services/account.service';
import { handleUpdatePostingData } from '../services/peer.service';
import { IpfsHandler } from '../../main/core/components/ipfsHandler';
import ProgramRunner from '../../main/core/components/ProgramRunner';
import PromiseIPC from 'electron-promise-ipc';
import ArraySearch from 'arraysearch';
import Path from 'path';
import os from 'os';
import { create } from 'ipfs-http-client';

export function ProofOfAccessView() {
  const [ipfsPeerID, setIpfsPeerID] = useState('');
  const [alreadyEnabled, setAlreadyEnabled] = useState(false);
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const updater = new PoAInstaller();
  const Finder = ArraySearch.Finder;
  const [isPoARunning, setIsPoARunning] = useState(false);
  const runner = useRef<ProgramRunner | null>(null);

  const getIpfsConfig = async () => {
    try {
      const ipfs = create({ url: 'http://localhost:5001' }); // Replace with your IPFS API address if it's different
      const { id } = await ipfs.id();
      console.log('peerId', id);

      setIpfsPeerID(id);
    } catch (error) {
      console.error('Error getting IPFS peer ID:', error);
    }
  };

  const runPoA = async () => {
    if (!isPoARunning) {
      const profileID = window.localStorage.getItem('SNProfileID');
      const getAccount = (await PromiseIPC.send('accounts.get', profileID as any)) as any;
      const hiveInfo = Finder.one.in(getAccount.keyring).with({ type: 'hive' });
      const installDir = Path.join(os.homedir(), (await PoAInstaller.getDefaultPath()) || '');
      const executablePath = Path.join(installDir, 'PoA.exe');
      const command = `"${executablePath}" -node=2 -username=${hiveInfo.username}`;

      if (!runner.current) {
        runner.current = new ProgramRunner(command, (data: string) => {
          terminal?.write(data.replace(/\n/g, '\r\n'));
        });
      }

      runner.current.runProgram(() => {
        setIsPoARunning(false);
      });
      setIsPoARunning(true);
    } else {
      runner.current.stopProgram();
      setIsPoARunning(false);
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

  const enableProofOfAccess = async () => {
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
    if (terminalRef.current && !terminal) {
      const term = new Terminal();
      term.open(terminalRef.current);
      term.loadAddon(new WebLinksAddon());
      setTerminal(term);
    }
    void getIpfsConfig();
    void loadAlreadyEnabled();
  }, [terminal]);

  return (
    <div style={{ padding: '5px', overflow: 'hidden' }}>
      <h3>Proof of Access.</h3>
      <p>
        Enable the Proof of Access feature to earn rewards for storing data on your computer.
      </p>
      <p>
        <b>
          By enabling proof of access your ipfs peer ID will be published to your hive profile metadata
        </b>
      </p>
      <p>
        <div>
          {alreadyEnabled ? (
            <Button  variant="light"
                     size="sm"
                     onClick={() => {
                       void enableProofOfAccess();
                     }}
            >
              <span>Update Peer Id</span>
            </Button>
          ) : (
            <Button
              variant="light"
              size="sm"
              onClick={() => {
                void enableProofOfAccess();
              }}
            >
              <span>Enable Proof of Access</span>
            </Button>
          )}
        </div>
      </p>
      <p>
        <div>
          <Button
            variant="light"
            size="sm"
            onClick={() => {
              void updater.main();
            }}
          >
            <span>Update Proof of Access</span>
          </Button>
        </div>
      </p>
      <p>
        <div>
          <Button
            variant="light"
            size="sm"
            onClick={() => {
              void runPoA();
            }}
          >
            <span>{isPoARunning ? 'Shutdown' : 'Start'} Proof of Access</span>
          </Button>
        </div>
      </p>
      <div ref={terminalRef} style={{ width: '100%', height: '200px', backgroundColor: 'black' }} />
    </div>
  );
}
