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
import './App.css'
import './main.css'

export class App extends React.PureComponent {
  render() {
    return (
      <div>
        <Components.Topbar/>
        <HashRouter>
          <Switch>
            <Route path="/watch">
              <views.watch/>
            </Route>
          </Switch>
        </HashRouter>
      </div>
    );
  }
}
