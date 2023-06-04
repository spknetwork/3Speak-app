// Type: file name: src\renderer\views\PoAView\usePoAProgramRunner.ts
import { usePoAState } from './PoAStateContext';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ProgramRunner from '../../../main/core/components/ProgramRunner';
import PoAInstaller from '../../../main/AutoUpdaterPoA';
import { Terminal } from 'xterm';
import Path from 'path';
import os from 'os';
import ArraySearch from 'arraysearch';
import PromiseIPC from 'electron-promise-ipc';

export const usePoAProgramRunner = () => {
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [isPoARunning, setIsPoARunning] = useState(false);
  const runner = useRef<ProgramRunner | null>(null);
  const poaInstaller = useRef(new PoAInstaller());
  const Finder = ArraySearch.Finder;
  const { logs, setLogs } = usePoAState();
  const isMountedRef = useRef(true);

  const runPoA = useCallback(async () => {
    let command = '';  // Define command here
    if (!isPoARunning) {
      const profileID = localStorage.getItem('SNProfileID');
      const getAccount = (await PromiseIPC.send('accounts.get', profileID as any)) as any;
      const hiveInfo = Finder.one.in(getAccount.keyring).with({ type: 'hive' });
      const installDir = Path.join(os.homedir(), (await poaInstaller.current.getDefaultPath()) || '');
      const executablePath = Path.join(installDir, 'PoA.exe');
      command = `"${executablePath}" -node=2 -username=${hiveInfo.username} -IPFS_PORT=5004`;  // Assign command here
      if (!runner.current) {
        runner.current = new ProgramRunner(command, (data: string) => {
          if (!isMountedRef.current) return;
          const logData = data.replace(/\n/g, '\r\n');
          terminal?.write(logData);
          setLogs(prevLogs => [...prevLogs, logData]);
        });
      }

      runner.current.setupProgram(() => {
        if (!isMountedRef.current) return;
        setIsPoARunning(false);
      });
      setIsPoARunning(true);
    } else {
      runner.current.stopProgram();
      setIsPoARunning(false);
    }
  }, [terminal, isPoARunning]);

  const contextValue = {
    isPoARunning,
    setIsPoARunning,
    runPoA,
    stopPoA: () => runner.current?.stopProgram(),
  };

  return { terminal, setTerminal, isPoARunning, runPoA, contextValue };
}
