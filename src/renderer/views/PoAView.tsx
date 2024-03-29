// Filename: PoAView.tsx
import 'brace/mode/json';
import 'brace/theme/github';
import 'brace/theme/monokai';
import 'brace/theme/solarized_dark';
import 'jsoneditor-react/es/editor.min.css';
import React, { useEffect } from 'react';
import { Terminal } from 'xterm';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

import { PoAViewContent } from './PoAView/PoAViewContent';
import { usePoAInstaller } from './PoAView/usePoAInstaller';
import { usePoAProgramRunner } from './PoAView/usePoAProgramRunner';
import { usePoAProgramRunnerContext } from './PoAView/PoAProgramRunnerContext';

export function PoAView() {
  const { programRunner, setProgramRunner, terminalRef } = usePoAProgramRunnerContext();

  const updater = usePoAInstaller();
  const { terminal, setTerminal, isPoARunning, runPoA, contextValue, storageSize, autoPin, setAutoPin, setStorageSize } = usePoAProgramRunner();
  const { stopPoA } = contextValue;
  useEffect(() => {
    if (terminalRef.current && !terminal) {
      const term = new Terminal();
      term.open(terminalRef.current);
      term.loadAddon(new WebLinksAddon());
      setTerminal(term);
    }

    return () => {
      if (terminal) {
        terminal.dispose();
      }
    };
  }, [terminal, terminalRef]);

  return (
    <PoAViewContent
      isPoARunning={isPoARunning}
      updatePoA={updater.updatePoA}
      runPoA={runPoA}
      stopPoA={stopPoA}
      terminalRef={terminalRef}
      storageSize={storageSize}
      autoPin={autoPin}
      setStorageSize={setStorageSize}
      setAutoPin={setAutoPin}
    />
  );
}
