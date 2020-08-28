import React from 'react';
import Components from "./components";
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  HashRouter,
  Link,
  Switch,
  Route
} from 'react-router-dom';
import views from './views';
import './css/App.css';
import './css/main.css';
import Sidebar from './components/Navbar';
import TopNavbar from './components/TopNavbar';

export class App extends React.PureComponent {
  render() {
    return (
      <div>
          <TopNavbar />
          <Sidebar />
          <HashRouter>
            <Switch>
              <Route path="/new" exact>
                <views.GridFeed awaitingMoreData={false} type="new" />
              </Route>
              <Route path="/trends" exact>
                <views.GridFeed awaitingMoreData={false} type="trending" />
              </Route>
              <Route path="/watch/:reflink" component={views.watch} />
              <Route path="/user/:reflink" component={views.User} />
              <Route path="/blocklist/" component={views.Blocklist} />
              <Route path="/communities/" component={views.Communities} />
              <Route path="/leaderboard/" component={views.Leaderboard} />
            </Switch>
          </HashRouter>
      </div>
    );
  }
}
