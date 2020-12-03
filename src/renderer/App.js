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
import 'react-notifications/lib/notifications.css';
import {NotificationContainer} from 'react-notifications';
import Popup from 'react-popup';
import './css/Popup.css';
import StartUp from './StartUp';

export class App extends React.PureComponent {
  render() {
    return (
      <div>
        <StartUp/>
          <Popup className="mm-popup"
            btnClass="mm-popup__btn"
            closeBtn={false}
            closeHtml={null}
            defaultOk="Ok"
            defaultCancel="Cancel"
            wildClasses={false}
            escToClose={true}/>
          <NotificationContainer/>
          <TopNavbar />
          <Sidebar />
          <HashRouter>
            <Switch>
              <Route path="/" exact>
                <views.GridFeed awaitingMoreData={true} type="home" />
              </Route>
              <Route path="/new" exact>
                <views.GridFeed awaitingMoreData={false} titleText="New Videos" type="new" />
              </Route>
              <Route path="/trends" exact>
                <views.GridFeed awaitingMoreData={false} titleText="Trending Videos" type="trending" />
              </Route>
              <Route path="/newcomers" exact>
                <views.GridFeed awaitingMoreData={true} titleText="First Uploads" type="firstUploads" />
              </Route>
              <Route path="/watch/:reflink" component={views.watch}/>
              <Route path="/user/:reflink" component={views.User} />
              <Route path="/blocklist/" component={views.Blocklist} />
              <Route path="/communities/" component={views.Communities} />
              <Route path="/community/:reflink" component={views.Community}/>
              <Route path="/leaderboard/" component={views.Leaderboard} />
              <Route path="/pins/" component={views.Pins} />
              <Route path="/ipfsconsole/" component={views.IpfsConsole} />
              <Route path="/creatorstudio/" component={views.CreatorStudio} />
              <Route component={views.NotFound} />
            </Switch>
          </HashRouter>
      </div>
    );
  }
}
