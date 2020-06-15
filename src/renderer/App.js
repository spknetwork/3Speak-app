import React from 'react';

import {Header} from './components/Header';
import {Body} from './components/Body';

export class App extends React.PureComponent {
  render() {
    return (
      <div style={styles.container}>
        <Header/>
        <Body/>
      </div>
    );
  }
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100vh'
  }
}