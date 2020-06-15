import React from 'react';

import './Body.less';

export class Body extends React.PureComponent {
  render() {
    return (
      <div className={'body-container'}>
        <img className={'author-head-img'} src={require('../assets/images/head.jpg')}/>
        <p className={'content-text'}>
          Hello, if you want to learn more, click <a className={'href-text'} href={'https://github.com/SmallStoneSK/electron-react-template'} target={'blank'}>here</a>.
        </p>
      </div>
    );
  }
}