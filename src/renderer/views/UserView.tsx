import React, { useEffect, useMemo, useState } from 'react'
import { Navbar, Nav, Card, Col, Row, Button } from 'react-bootstrap'
import RefLink from '../../main/RefLink'
import { Switch, Route } from 'react-router-dom'
import '../css/User.css'
import ReactMarkdown from 'react-markdown'
import { AccountService } from '../services/account.service'
import { GridFeedView } from './GridFeedView'
import { FollowWidget } from '../components/widgets/FollowWidget'

/**
 * User about page with all the public information a casual and power user would need to see about another user.
 */
export function UserView(props: any) {
  const [profileAbout, setProfileAbout] = useState('')
  const [hiveBalance, setHiveBalance] = useState<number>()
  const [hbdBalance, setHbdBalance] = useState<number>()
  const [coverUrl, setCoverUrl] = useState('')
  const [profileUrl, setProfileUrl] = useState('')

  const reflink = useMemo(() => {
    return RefLink.parse(props.match.params.reflink)
  }, [props.match])

  const username = useMemo(() => {
    return reflink.root
  }, [reflink])

  useEffect(() => {
    const load = async () => {
      const accountBalances = await AccountService.getAccountBalances(reflink)

      setProfileUrl(await AccountService.getProfilePictureURL(reflink))
      setProfileAbout(await AccountService.getProfileAbout(reflink))
      setHiveBalance(accountBalances.hive)
      setHbdBalance(accountBalances.hbd)
      setCoverUrl(await AccountService.getProfileBackgroundImageUrl(reflink))
    }

    void load()
  }, [reflink])

  return (
    <div>
      <div className="single-channel-image">
        <img
          className="img-fluid mh-20"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            maxHeight: '500px',
          }}
          alt=""
          src={coverUrl}
        />
        <div className="channel-profile" style={{ position: profileUrl ? 'absolute' : 'unset' }}>
          <img className="channel-profile-img" alt="" src={profileUrl} />
        </div>
      </div>
      <div className="single-channel-nav">
        <Navbar expand="lg" bg="light">
          <a className="channel-brand">{username}</a>
          <Navbar.Toggle
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </Navbar.Toggle>
          <Navbar.Collapse id="navbarSupportedContent">
            <Nav className="mr-auto">
              <Nav.Link href={`#/user/${reflink.toString()}/`}>
                Videos <span className="sr-only">(current)</span>
              </Nav.Link>
              <Nav.Link href={`#/user/${reflink.toString()}/earning`}>Earnings</Nav.Link>
              <Nav.Link href={`#/user/${reflink.toString()}/about`}>About</Nav.Link>
            </Nav>
            <div className="form-inline my-2 my-lg-0">
              <FollowWidget reflink={reflink.toString()} />
            </div>
          </Navbar.Collapse>
        </Navbar>
      </div>
      <Switch>
        <Route exact path={`/user/${reflink.toString()}`}>
          <section className="content_home" style={{ height: 'auto !important' }}>
            <GridFeedView type={'@' + username} awaitingMoreData={true} />
          </section>
        </Route>
        <Route path={`/user/${reflink.toString()}/earning`}>
          <Row>
            <Col md={6}>
              <Card className="bg-steem status">
                <Card.Header>
                  <Card.Title className="text-center">{hiveBalance}</Card.Title>
                </Card.Header>
                <Card.Body className="bg-white text-center">
                  <strong>Available HIVE Balance</strong>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="bg-sbd status">
                <Card.Header>
                  <Card.Title className="text-center">{hbdBalance}</Card.Title>
                </Card.Header>
                <Card.Body className="bg-white text-center">
                  <strong>Available HBD Balance</strong>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Route>
        <Route path={`/user/${reflink.toString()}/about`}>
          <ReactMarkdown className={'p-3'} source={profileAbout} />
        </Route>
      </Switch>
    </div>
  )
}
