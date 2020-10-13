import React from 'react';
import { Navbar, Nav, Breadcrumb, FormControl, Button } from 'react-bootstrap'
import "./Navbar.css";
import { FaAngleRight, FaAngleLeft, FaCopy, FaEdit } from 'react-icons/fa'

class TopNavbar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            urlSplit: [],
            inEdit: false
        };
        this.startEdit = this.startEdit.bind(this);
        this.exitEdit = this.exitEdit.bind(this);
        this.finishEdit = this.finishEdit.bind(this);
        this.UrlForm = React.createRef();
    }
    startEdit() {
        this.setState({
            inEdit: true
        }, () => {
            console.log(this.UrlForm)
            this.UrlForm.current.focus();
        })
    }
    exitEdit() {
        this.setState({
            inEdit: false
        })
    }
    finishEdit(e) {
        if (e.keyCode === 13) {
            console.log(e.target.value)
            location.replace(`#${e.target.value}`)
            this.setState({
                inEdit: false
            })
            location.reload();
        } else if(e.keyCode === 27) {
            this.exitEdit();
        }
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
        windowLocationHref = windowLocationHref.split('/')
        windowLocationHref.splice(0, 1);

        let userProfileUrl = '#/user/';

        if (windowLocationHref[0] === 'watch') {
            const userProfileUrlInit = windowLocationHref[1]
            const userProfileUrlSpliced = userProfileUrlInit.split(':')
            userProfileUrlSpliced.pop()
            
            userProfileUrlSpliced.forEach(one => {
                if (one === userProfileUrlSpliced[0]) {
                    userProfileUrl = userProfileUrl + one + ':'
                } else {
                    userProfileUrl = userProfileUrl + one
                }
                
            })
        }


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
                    {
                        !this.state.inEdit ? 
                        <React.Fragment>
                            <Breadcrumb>
                                <Breadcrumb.Item href="#/">Home</Breadcrumb.Item>
                                {this.state.urlSplit.map(el => (
                                    (el === this.state.urlSplit[1] && this.state.urlSplit[0] === 'watch') ? <Breadcrumb.Item href={userProfileUrl} key={el} id={el}>{el}</Breadcrumb.Item>:<Breadcrumb.Item href={'#'} key={el} id={el}>{el}</Breadcrumb.Item>
                                ))}
                            </Breadcrumb>
                            <Button className="btn btn-light btn-sm" style={{marginLeft: "5px", width: "10%", height: "10%", padding:"3.5%", verticalAlign: "baseline"}}onClick={this.startEdit}>
                                <FaEdit style={{ textAlign: "center", verticalAlign: "initial"}}/>
                            </Button>
                            </React.Fragment>:<FormControl 
                            ref={this.UrlForm}
                            defaultValue={(() => {
                                return location.hash.slice(1)
                            })()} 
                            onKeyDown={this.finishEdit}
                            onBlur={this.exitEdit}/>
                    }
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
