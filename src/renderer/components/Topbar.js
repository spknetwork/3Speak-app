import React from 'react';
import { Navbar, Nav, NavDropdown, Form, Button, FormControl } from 'react-bootstrap'

class Topbar extends React.Component {
    _handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            console.log(e.target.parent)
        }
    }
    handleSearchSubmit(e) {
        e.persist()
        e.preventDefault()
    }
    render() {
        return <div>
            <Navbar bg="light" expand="lg">
                <Navbar.Brand href="#home">3Speak</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                        <Nav.Link href="#home">Home</Nav.Link>
                        <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>

                        </NavDropdown>
                        <Form inline onSubmit={this.handleSearchSubmit}>
                            <FormControl name="query" type="text" placeholder="Search or insert permlink" className="mr-sm-2" />
                        </Form>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </div>
    }
}
export default Topbar;