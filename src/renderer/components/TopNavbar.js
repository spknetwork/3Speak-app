import React from 'react';
import { Navbar, Nav, NavDropdown, ButtonGroup, Dropdown, Breadcrumb } from 'react-bootstrap'
import "./Navbar.css"
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  useLocation
} from "react-router-dom";



class TopNavbar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {urlSplit: []};
    }
    
    HeaderView() {
        let urlSplit;
        const windowLocation = window.location.href
        
        urlSplit = windowLocation.split('/')
        const newUrl = urlSplit.splice(0, 4);

        this.setState({
            urlSplit: urlSplit
        });
        


        window.addEventListener('popstate', function (event) {
            const windowLocation = window.location.href

            urlSplit = windowLocation.split('/')
            const newUrl = urlSplit.splice(0, 4);

            this.setState({
                urlSplit: urlSplit
            });
            
        }.bind(this));
    }
    
    componentDidMount() {
        this.HeaderView();
    }

    render() {
        return (
           <div>
                 <Navbar bg="light" expand="lg">
                    <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                    <Breadcrumb>
                        <Breadcrumb.Item href="/">Home</Breadcrumb.Item>
                        {this.state.urlSplit.map(el => (
                            <Breadcrumb.Item href="#" key={el}>{el}</Breadcrumb.Item>
                        ))}
                    </Breadcrumb>
                    </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </div>
        );
    }
}

export default TopNavbar;