// PinCids.tsx
import React, { useState } from 'react';
import ace from 'brace';
import Popup from 'react-popup'
import 'jsoneditor-react/es/editor.min.css'
import { JsonEditor as Editor } from 'jsoneditor-react'

const PinCids = ({ pin }) => {
  console.log('PinCids', pin);
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleOpen = () => {
    console.log('handleOpen');
    setIsOpen(true);
  };

  if (pin.cids.length > 1) {
    return (
      <a
        onClick={() => {
          Popup.create({
            title: 'CIDs',
            content: (
              <div>
                <Editor value={pin.cids} ace={ace} theme="ace/theme/github"></Editor>
              </div>
            ),
            buttons: {
              left: [],
              right: [
                {
                  text: 'close',
                  key: '⌘+s',
                  className: 'success',
                  action: function () {
                    Popup.close()
                  },
                },
              ],
            },
          })
        }}
      >
        View ({pin.cids.length})
      </a>
    );
  } else {
    return <div></div>;
  }
};

export default PinCids;
