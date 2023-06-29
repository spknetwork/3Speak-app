import { useState, useEffect } from 'react';
import PoAInstaller from '../../../main/AutoUpdaterPoA';
import { Terminal } from 'xterm';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

export function usePoAInstaller() {
  const [terminal, setTerminal] = useState<Terminal | null>(null);
  const updater = new PoAInstaller();

  const updatePoA = async () => {
    try {
      await updater.main();
    } catch (error) {
      console.error('Error updating Proof of Access:', error);
    }
    return
  };

  const initTerminal = (terminalRef: React.RefObject<HTMLDivElement>) => {
    if (terminalRef.current && !terminal) {
      const term = new Terminal();
      term.open(terminalRef.current);
      term.loadAddon(new WebLinksAddon());
      setTerminal(term);
    }
  };

  useEffect(() => {
    if (terminal) {
      updater.on('data', (data: string) => {
        terminal.write(data.replace(/\n/g, '\r\n'));
      });
    }
  }, [terminal]);

  return {
    updatePoA,
    initTerminal,
  };
}
