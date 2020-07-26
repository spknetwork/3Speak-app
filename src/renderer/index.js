import React from 'react';
import {render} from 'react-dom';

import {App} from './App';
import './i18n';

window.$ = window.jQuery = require('jquery');
var shell = require('electron').shell;
//open links externally by default
$(document).on('click', 'a[href^="http"]', function(event) {
    event.preventDefault();
    shell.openExternal(this.href);
});
render(
  <App />,
  document.getElementById('app')
);