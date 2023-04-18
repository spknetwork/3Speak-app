// PinsView.tsx
import 'brace/mode/json';
import 'brace/theme/github';
import 'jsoneditor-react/es/editor.min.css';

import ace from 'brace';
import React, { useMemo, useRef, useState } from 'react';
import Popup from 'react-popup';
import { JsonEditor as Editor } from 'jsoneditor-react';

import { PinsViewComponent } from './PinsView/PinsViewComponent';
import { pinRows } from './PinsView/PinRows';
import { usePinningUtils } from './PinsView/pinningUtils';

export function PinsView() {
  const {
    newVideos,
    trendingVideos,
    pinList,
    updateSearchTables,
    PinLocally,
    actionSelect,
    removePin,
  } = usePinningUtils();

  const [showExplorer, setShowExplorer] = useState(false);
  const pid = useRef<any>();


  const rows = useMemo(() => pinRows(pinList, removePin), [pinList, removePin, ace]);

  return (
    <PinsViewComponent
      pinRows={rows}
      showExplorer={showExplorer}
      newVideos={newVideos}
      trendingVideos={trendingVideos}
      actionSelect={actionSelect}
      removePin={removePin}
      PinLocally={PinLocally}
      setShowExplorer={setShowExplorer}
      updateSearchTables={updateSearchTables}
    />
  );
}
