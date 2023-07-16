import './Navbar.css'

import React, { useEffect, useState } from 'react'
import { Dropdown, Nav, Navbar, NavDropdown } from 'react-bootstrap'
import { BsFillGearFill } from 'react-icons/bs'
import { FaDiscord, FaGlobe, FaTelegram, FaToolbox, FaTwitter, FaUsers } from 'react-icons/fa'
import { VscKey } from 'react-icons/vsc'

import SpeakLogo from '../assets/img/3S_logo.svg'
import iconBlog from '../assets/img/blog.png'
import iconHome from '../assets/img/icon_home.svg'
import iconLeaderboard from '../assets/img/icon_leaderboard.svg'
import iconNewContent from '../assets/img/icon_new_content.svg'
import iconNewcomer from '../assets/img/icon_newcomer.svg'
import iconTrend from '../assets/img/icon_trend.svg'
import shakeHands from '../assets/img/shake-hands.svg'
import { AccountService } from '../services/account.service'

export const SideNavbar = () => {
  const [login, setLogin] = useState('')
  const [myChannelLink, setMyChannelLink] = useState('')

  useEffect(() => {
    const load = async () => {
      const login = localStorage.getItem('SNProfileID')
      if (login) {
        const user = (await AccountService.getAccount(login)) as any
        const ringItem = user.keyring[0]
        setLogin(user.nickname)
        setMyChannelLink(`${ringItem.type}:${ringItem.username}`)
      }
    }

    void load()
  }, [login])

  const logOut = async () => {
    //TODO: logout logic

    const profileID = localStorage.getItem('SNProfileID')

    const user = await AccountService.logout(profileID)
    const accountsInit = (await AccountService.getAccounts()) as any
    localStorage.removeItem('SNProfileID')
    if (accountsInit.length > 0) {
      localStorage.setItem('SNProfileID', accountsInit[0]._id)
    }
    window.location.reload()
  }

  return (
    <Navbar
      bg="white"
      expand="lg"
      id="layoutNav"
      className="bg_white fixed-left"
      style={{ overflow: 'scroll' }}
    >
      <Navbar.Brand>
        <img src={SpeakLogo} />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav">
        <span className="navbar-toggler-icon"></span>
      </Navbar.Toggle>
      <Navbar.Collapse>
        <Nav className="mr-auto nav_dist">
          {login && (
            <NavDropdown
              id="nav-dropdown"
              title={
                <>
                  <div className="nav_icons">
                    <VscKey size="21px" />
                  </div>
                  <span>@{login}</span>
                </>
              }
            >
              <NavDropdown.Item href="#/accounts">Switch account</NavDropdown.Item>
              <NavDropdown.Item href={`#/user/${myChannelLink}`}>Go to my channel</NavDropdown.Item>
              <NavDropdown.Item href="#/login">Add account</NavDropdown.Item>
              {login && (
                <NavDropdown.Item
                  onClick={() => {
                    logOut()
                  }}
                >
                  Log out
                </NavDropdown.Item>
              )}
            </NavDropdown>
          )}
          {!login && (
            <Nav.Link href="#/login">
              <button className="btn btn-outline-light  btn-block text-dark">Add account</button>
            </Nav.Link>
          )}
          <hr />
          <Nav.Link href="#/home">
            <div className="nav_icons">
              <img src={iconHome} height="14px" />
            </div>
            Home
          </Nav.Link>
          <Nav.Item></Nav.Item>
          <Nav.Link href="#/trends">
            <div className="nav_icons">
              <img src={iconTrend} height="21px" />
            </div>
            Trending Content
          </Nav.Link>
          <Nav.Link href="#/new">
            <div className="nav_icons">
              <img src={iconNewContent} height="17px" />
            </div>
            New Content
          </Nav.Link>

          <NavDropdown
            id="nav-dropdown"
            title={
              <>
                <div className="nav_icons">
                  <img src={shakeHands} style={{ height: '21px' }} />
                </div>
                Communities
              </>
            }
          >
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
              <FaUsers />
              &nbsp;Coronavirus Pandemic
            </NavDropdown.Item>
            <NavDropdown.Item href="#/community/hive:hive-196427">
              <FaUsers /> &nbsp;COVID-19
            </NavDropdown.Item>
          </NavDropdown>
          <Nav.Link href="#/leaderboard">
            <div className="nav_icons">
              <img src={iconLeaderboard} height="12px" />
            </div>
            Leaderboard
          </Nav.Link>
          {/* <Nav.Link href="#/newcomers">
            <div className="nav_icons">
              <img src={iconNewcomer} height="19px" />
            </div>
            First Uploads 
          </Nav.Link> */}
          {/* <Nav.Link href="#/uploader">
            <div className="nav_icons">
              <FaToolbox />
            </div>
            Uploader
          </Nav.Link> */}
          <Nav.Link href="#/creatorstudio">
            <div className="nav_icons">
              <FaToolbox />
            </div>
            Creator Studio
          </Nav.Link>
          <NavDropdown
            id="nav-dropdown"
            title={
              <>
                <div className="nav_icons">
                  <BsFillGearFill style={{ height: '21px' }} />
                </div>
                Settings
              </>
            }
          >
            <Nav.Link href="#/blocklist">
              <FaGlobe /> Blocklist
            </Nav.Link>
            <Nav.Link href="#/pins">
              <FaGlobe /> Pins
            </Nav.Link>
            <Nav.Link href="#/ipfsconsole">
              <FaGlobe /> Ipfs Console
            </Nav.Link>
            <Nav.Link href="#/proofofaccess">
              <FaGlobe /> Proof of Access
            </Nav.Link>
          </NavDropdown>
        </Nav>

        <Nav>
          <li className="nav-item">
            <div className="pad_l">
              <h5>3Speak</h5>
            </div>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="https://3speak.tv/intl/about_us">
              About us
            </a>
          </li>
          <li className="nav-item">
            <a className="nav-link" href="https://3speak.tv/intl/about_us">
              FAQ
            </a>
          </li>

          <li className="nav-item text-center">
            <a
              className=""
              target="_blank"
              href="https://twitter.com/3speaktv?utm_source=3speak.tv"
            >
              <FaTwitter size={28} />
            </a>
            <a className="ml-2" target="_blank" href="https://t.me/threespeak?utm_source=3speak.tv">
              <FaTelegram size={28} />
            </a>
            <a
              className="ml-2"
              target="_blank"
              href="https://discord.me/3speak?utm_source=3speak.tv"
            >
              <i className="fab fa-discord text-muted fa-2x"></i>
              <FaDiscord size={28} />
            </a>
            <a
              className="ml-2"
              target="_blank"
              title="Visit Our Blog"
              href="https://hive.blog/@threespeak"
            >
              <img
                style={{ width: '32px', marginTop: '-15px', color: 'black' }}
                src={iconBlog}
                alt=""
              />
            </a>
          </li>

          <Dropdown title="Find us" className="nav-item dropdown mt-2 display-mobile">
            <Dropdown.Toggle
              className="btn btn-secondary btn-sm dropdown-toggle"
              variant="secondary"
              data-toggle="dropdown"
              aria-haspopup="true"
            >
              Find us
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <a className="dropdown-item" href="https://t.me/threespeak?utm_source=3speak.tv">
                Telegram
              </a>
              <a className="dropdown-item" href="https://discord.me/3speak?utm_source=3speak.tv">
                Discord
              </a>
              <a
                className="dropdown-item"
                target="_blank"
                href="https://twitter.com/3speakonline?utm_source=3speak.tv"
              >
                Twitter
              </a>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}
