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

export class App extends React.PureComponent {
  render() {
    return (
      <div>
          <Components.Topbar/>
          <HashRouter>
              <Switch>
                  <Route path="/new" exact>
                      <views.GridFeed type="new"/>
                  </Route>
                  <Route path="/trending" exact>
                      <views.GridFeed type="trending"/>
                  </Route>
                  <Route path="/watch" component={views.watch}/>
              </Switch>
          </HashRouter>
      </div>
    );
  }
}
