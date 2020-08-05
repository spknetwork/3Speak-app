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
import {Col, Container} from 'react-bootstrap'

export class App extends React.PureComponent {
  render() {
    return (
      <div>
          <Container>
            <Col>
              <Sidebar/>
            </Col>
            <Col>
              <HashRouter>
                  <Switch>
                      <Route path="/new" exact>
                          <views.GridFeed type="new"/>
                      </Route>
                      <Route path="/trends" exact>
                          <views.GridFeed type="trending"/>
                      </Route>
                      <Route path="/watch/:reflink" component={views.watch}/>
                  </Switch>
              </HashRouter>
            </Col>
          </Container>
      </div>
    );
  }
}
