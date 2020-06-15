import React from 'react';

import './Header.less';

import ReactLogo from '../assets/svg/react-logo.svg';
import ElectronLogo from '../assets/svg/electron-logo.svg';

export class Header extends React.PureComponent {
  render() {
    return (
      <div className={'header-container'}>
        <div className={'logo-wrapper'}>
          <img className={'logo electron-logo'} src={ElectronLogo}/>
          <p className={'logo-title'}>Electron</p>
        </div>
        <h3 className={'middle-text'}>+</h3>
        <div className={'logo-wrapper'}>
          <img className={'logo'} src={ReactLogo} />
          <p className={'logo-title'}>React</p>
        </div>
      </div>
    );
  }
}