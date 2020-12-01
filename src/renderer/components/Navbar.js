import React, { Component } from 'react';
import iconHome from '../assets/img/icon_home.svg'
import iconTrend from '../assets/img/icon_trend.svg'
import iconNewContent from '../assets/img/icon_new_content.svg'
import iconLeaderboard from '../assets/img/icon_leaderboard.svg'
import iconNewcomer from '../assets/img/icon_newcomer.svg'
import iconBlog from '../assets/img/blog.png'
import shakeHands from '../assets/img/shake-hands.svg'
import SpeakLogo from '../assets/img/3S_logo.svg'
import { FaDiscord, FaTwitter, FaGlobe, FaUsers, FaTelegram, FaToolbox } from 'react-icons/fa'
import { BsFillGearFill } from 'react-icons/bs'
import { Navbar, Nav, NavDropdown, ButtonGroup, Dropdown } from 'react-bootstrap'
import "./Navbar.css"

class SideBar extends Component {
    constructor(props) {
        super(props);
        this.state = {}
    }
    render() {
        return (<Navbar bg="white" expand="lg" id="layoutNav" className="bg_white fixed-left">
            <Navbar.Brand><img src={SpeakLogo} /></Navbar.Brand>
            <a href="#/auth/login" className="display-mobile">
                <button className="btn btn-dark text-white btn-sm">
                    Log In / Sign Up
                </button>
            </a>
            <Navbar.Toggle aria-controls="basic-navbar-nav">
                <span className="navbar-toggler-icon"></span>
            </Navbar.Toggle>
            <Navbar.Collapse >
                <Nav className="mr-auto nav_dist">
                    <Nav.Link href="#/">
                            <div className="nav_icons"><img src={iconHome} height="14px" /></div>
                            Home
                    </Nav.Link>
                    <Nav.Item></Nav.Item>
                    <Nav.Link href="#/trends">
                        <div className="nav_icons"><img src={iconTrend} height="21px" />
                        </div>
                            Trending Content
                    </Nav.Link>
                    <Nav.Link href="#/new">
                        <div className="nav_icons"><img src={iconNewContent} height="17px" /></div>
                        New Content

                    </Nav.Link>


                    <NavDropdown title={<React.Fragment>
                        <div className="nav_icons"><img src={shakeHands} style={{ height: "21px" }} />

                        </div>Communities</React.Fragment>}>
                        <Nav.Link href="#/communities">
                            <FaGlobe /> All Communities...
                        </Nav.Link>
                        <NavDropdown.Item href="#/community/hive:hive-181335">
                            <FaUsers /> Threespeak
                        </NavDropdown.Item>
                        <NavDropdown.Item href="#/community/hive:hive-153014">
                            <FaUsers /> Citizen Journalists
                        </NavDropdown.Item>
                        
                        <NavDropdown.Item href="#/community/hive:hive-112355">
                            <FaUsers /> Threeshorts
                        </NavDropdown.Item>
                        <NavDropdown.Item href="#/community/hive:hive-129768">
                            <FaUsers />&nbsp;Coronavirus Pandemic
                        </NavDropdown.Item>
                        <NavDropdown.Item href="#/community/hive:hive-196427">
                            <FaUsers /> &nbsp;COVID-19
                        </NavDropdown.Item>
                    </NavDropdown>
                    <Nav.Link href="#/leaderboard">
                        <div className="nav_icons"><img src={iconLeaderboard} height="12px" />
                        </div>
                        Leaderboard

                    </Nav.Link>
                    <Nav.Link href="#/newcomers">
                        <div className="nav_icons"><img src={iconNewcomer} height="19px" />
                        </div>
                            First Uploads
                    </Nav.Link>
                    <Nav.Link href="#/creatorstudio">
                        <div className="nav_icons"><FaToolbox/>
                        </div>
                            Creator Studio
                    </Nav.Link>
                    <NavDropdown title={<React.Fragment>
                        <div className="nav_icons"><BsFillGearFill style={{ height: "21px" }} />

                        </div>Settings</React.Fragment>}>
                        <Nav.Link href="#/blocklist">
                            <FaGlobe /> Blocklist
                        </Nav.Link>
                        <Nav.Link href="#/pins">
                            <FaGlobe /> Pins
                        </Nav.Link>
                        <Nav.Link href="#/ipfsconsole">
                            <FaGlobe /> Ipfs Console
                        </Nav.Link>
                    </NavDropdown>
                </Nav>

                <Nav mt={3}>
                    <li className="nav-item">
                        <div className="pad_l"><h5>3Speak</h5></div>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="https://3speak.co/intl/about_us">About us</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="https://3speak.co/intl/about_us">FAQ</a>
                    </li>

                    <li className="nav-item text-center">
                        <a className="" target="_blank" href="https://twitter.com/3speakonline?utm_source=3speak.co">
                            <FaTwitter size={28} />
                        </a>
                        <a className="ml-2" target="_blank" href="https://t.me/threespeak?utm_source=3speak.co">
                            <FaTelegram size={28} />
                        </a>
                        <a className="ml-2" target="_blank" href="https://discord.me/3speak?utm_source=3speak.co">
                            <i className="fab fa-discord text-muted fa-2x"></i>
                            <FaDiscord size={28} />
                        </a>
                        <a className="ml-2" target="_blank" title="Visit Our Blog" href="https://hive.blog/@threespeak">
                            <img style={{ width: "32px", marginTop: "-15px", color: "black" }} src={iconBlog} alt="" />
                        </a>
                    </li>


                    <Dropdown title="Find us" className="nav-item dropdown mt-2 display-mobile">
                        <Dropdown.Toggle className="btn btn-secondary btn-sm dropdown-toggle" variant="secondary" data-toggle="dropdown" aria-haspopup="true">
                            Find us
                            </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <a className="dropdown-item" href="https://t.me/threespeak?utm_source=3speak.co">Telegram</a>
                            <a className="dropdown-item" href="https://discord.me/3speak?utm_source=3speak.co">Discord</a>
                            <a className="dropdown-item" target="_blank" href="https://twitter.com/3speakonline?utm_source=3speak.co">Twitter</a>
                        </Dropdown.Menu>
                    </Dropdown>

                </Nav>

            </Navbar.Collapse>
        </Navbar>);
    }
}

export default SideBar;