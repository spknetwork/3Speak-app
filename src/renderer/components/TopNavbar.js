import React from 'react';
import { Navbar, Nav, Breadcrumb } from 'react-bootstrap'
import "./Navbar.css";
import { FaAngleRight, FaAngleLeft, FaCopy } from 'react-icons/fa'



let items = []


class TopNavbar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            urlSplit: []
        };
    }
    
    HeaderView() {
        let urlSplit;
        const windowLocation = window.location.hash
        
        urlSplit = windowLocation.split('/')
        urlSplit.splice(0, 1);

        this.setState({
            urlSplit: urlSplit
        });

        if (urlSplit[0] === 'watch') {
            const pagePerm = urlSplit[1]
            const pagePermSpliced = pagePerm.split(':')
            pagePermSpliced.splice(0, 1)
            urlSplit.pop()
            pagePermSpliced.forEach(onePagePerm => {
                urlSplit.push(onePagePerm)
            })

            this.setState({
                urlSplit: urlSplit
            })
        }        


        window.addEventListener('popstate', function (event) {
            const windowLocation = window.location.hash

            urlSplit = windowLocation.split('/')
            urlSplit.splice(0, 1);

            this.setState({
                urlSplit: urlSplit
            });

            if (urlSplit[0] === 'watch') {
                const pagePerm = urlSplit[1]
                const pagePermSpliced = pagePerm.split(':')
                pagePermSpliced.splice(0, 1)
                urlSplit.pop()
                pagePermSpliced.forEach(onePagePerm => {
                    urlSplit.push(onePagePerm)
                })

                this.setState({
                    urlSplit: urlSplit
                })
            }
            
        }.bind(this));
    }
    
    componentDidMount() {
        this.HeaderView();
    }

    render() {
        let windowLocationUrl = window.location.hash
        let windowLocationSearch = windowLocationUrl.search('#')
        let windowLocationHref = windowLocationUrl.slice(windowLocationSearch)

        function copyToClip() {
            navigator.clipboard.writeText(windowLocationUrl)
            .catch(err => {
                console.log('Something went wrong', err);
            });
        }

        function goForth() {
            window.history.forward()
        }

        function goBack() {
            window.history.back()
        }

        return (
           <div>
                 <Navbar bg="light" expand="lg">
                    <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="mr-auto">
                    <Breadcrumb>
                        <Breadcrumb.Item href="#/">Home</Breadcrumb.Item>
                        {this.state.urlSplit.map(el => (
                            <Breadcrumb.Item href={'#/user/hive:' + el} key={el}>{el}</Breadcrumb.Item>
                        ))}
                    </Breadcrumb>
                    </Nav>
                    <Nav>
                        <Nav.Link><FaAngleLeft size={28} onClick={goBack} /></Nav.Link>
                        <Nav.Link><FaAngleRight size={28} onClick={goForth} /></Nav.Link>
                        <Nav.Link><FaCopy size={28} onClick={copyToClip} /></Nav.Link>
                    </Nav>
                    </Navbar.Collapse>
                </Navbar>
            </div>
        );
    }
}

export default TopNavbar;
