import React from 'react';
import Components from "./components"
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  HashRouter,
  Link,
  Switch,
  Route
} from 'react-router-dom';
import views from './views';
import './css/App.css'
import './css/main.css'
import NewFeed from "./views/NewFeed";

export class App extends React.PureComponent {
  render() {
    return (
      <div>
          <Components.Topbar/>
          <HashRouter>
              <Switch>
                  <Route path="/" exact>
                      <NewFeed/>
                  </Route>
                  <Route path="/watch">
                      <views.watch/>
                  </Route>
              </Switch>
          </HashRouter>
      </div>
    );
  }
}
