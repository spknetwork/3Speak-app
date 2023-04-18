import { useState, useRef, useEffect, useCallback } from 'react';
import ProgramRunner from '../../../main/core/components/ProgramRunner';
import PoAInstaller from '../../../main/AutoUpdaterPoA';
import { Terminal } from 'xterm';
import Path from 'path';
import os from 'os';
import ArraySearch from 'arraysearch';
import PromiseIPC from 'electron-promise-ipc'

export function usePoAProgramRunner(terminalRef: React.RefObject<HTMLDivElement>) {
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const [isPoARunning, setIsPoARunning] = useState(false);
  const runner = useRef<ProgramRunner | null>(null);
  const poaInstaller = useRef(new PoAInstaller());
  const Finder = ArraySearch.Finder;


  const runPoA = useCallback(async () => {
    if (!isPoARunning) {
      const profileID = localStorage.getItem('SNProfileID')
      const getAccount = (await PromiseIPC.send('accounts.get', profileID as any)) as any;
      const hiveInfo = Finder.one.in(getAccount.keyring).with({ type: 'hive' });
      const installDir = Path.join(os.homedir(), (await poaInstaller.current.getDefaultPath()) || '');
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
  }, [terminal, isPoARunning]);

  useEffect(() => {
    return () => {
      if (runner.current) {
        runner.current.stopProgram();
      }
    };
  }, []);

  return { terminal, setTerminal, isPoARunning, runPoA };
}
