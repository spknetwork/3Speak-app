// UserViewContent.tsx
import React from 'react';
import { Navbar, Nav, Card, Col, Row, Button } from 'react-bootstrap';
import { Switch, Route } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { GridFeedView } from './../GridFeedView';
import { FollowWidget } from '../../components/widgets/FollowWidget';

const UserViewContent = ({
                           coverUrl,
                           profileUrl,
                           username,
                           reflink,
                           hiveBalance,
                           hbdBalance,
                           profileAbout,
                         }) => {
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
            <GridFeedView username={username} type={'author-feed'} awaitingMoreData={true}/>
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
          <ReactMarkdown className={'p-3'}>{profileAbout}</ReactMarkdown>
        </Route>
      </Switch>
    </div>
  );
};

export default UserViewContent;
