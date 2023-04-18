import 'brace/mode/json';
import 'brace/theme/github';
import 'brace/theme/monokai';
import 'brace/theme/solarized_dark';
import 'jsoneditor-react/es/editor.min.css';
import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';

import { PoAViewContent } from './PoAView/PoAViewContent';
import { usePoAInstaller } from './PoAView/usePoAInstaller';
import { usePoAProgramRunner } from './PoAView/usePoAProgramRunner';
import { useEnablePoA } from './PoAView/useEnablePoA';

export function PoAView() {
  const terminalRef = useRef<HTMLDivElement>(null);
  const {
    alreadyEnabled,
    enablePoA,
    loadAlreadyEnabled,
  } = useEnablePoA();
  const updater = usePoAInstaller();
  const { terminal, setTerminal, isPoARunning, runPoA } = usePoAProgramRunner(terminalRef);

  useEffect(() => {
    if (terminalRef.current && !terminal) {
      const term = new Terminal();
      term.open(terminalRef.current);
      term.loadAddon(new WebLinksAddon());
      setTerminal(term);
    }
    void loadAlreadyEnabled();
  }, [terminal]);

  return (
    <PoAViewContent
      alreadyEnabled={alreadyEnabled}
      isPoARunning={isPoARunning}
      enablePoA={enablePoA}
      updatePoA={updater.updatePoA}
      runPoA={runPoA}
      terminalRef={terminalRef}
    />
  );
}