import React from 'react';
import { Tab, Tabs } from 'react-bootstrap';
import ace from 'brace';
import Popup from 'react-popup';
import { JsonEditor as Editor } from 'jsoneditor-react';

export function showDebug(videoInfo: any) {
  const metadata = videoInfo;
  Popup.registerPlugin('watch_debug', async function () {
    this.create({
      content: (
        <div>
          <Tabs defaultActiveKey="meta" id="uncontrolled-tab-example">
            <Tab eventKey="meta" title="Metadata">
              <Editor value={metadata} ace={ace} theme="ace/theme/github"></Editor>
            </Tab>
          </Tabs>
        </div>
      ),
      buttons: {
        right: [
          {
            text: 'Close',
            className: 'success',
            action: function () {
              Popup.close();
            },
          },
        ],
      },
    });
  });
  Popup.plugins().watch_debug();
}
