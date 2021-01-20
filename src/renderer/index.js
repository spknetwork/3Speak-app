import React from 'react';
import { render } from 'react-dom';
import contextMenu from 'electron-context-menu';

import { App } from './App';
import './i18n';


// This code adds 2 new items to the context menu to zoom in the window (in and out)
// Read other steps for more information
contextMenu({
  prepend: (params, browserWindow) => [
    {
      role: "zoomIn"
    },
    {
      role: "zoomOut"
    }
  ]
});

window.$ = window.jQuery = require('jquery');
var shell = require('electron').shell;
//open links externally by default
$(document).on('click', 'a[href^="http"]', function (event) {
  event.preventDefault();
  shell.openExternal(this.href);
});
render(
  <App />,
  document.getElementById('app')
);