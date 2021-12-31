import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Navbar, Nav, Breadcrumb, Dropdown, FormControl, Button } from 'react-bootstrap'
import './Navbar.css'
import { FaAngleRight, FaAngleLeft, FaCopy, FaArrowRight, FaEdit } from 'react-icons/fa'

function copyToClip(windowLocationUrl: string) {
  navigator.clipboard.writeText(windowLocationUrl).catch((err) => {
    console.error('Something went wrong writing text', err)
  })
}

function goForth() {
  window.history.forward()
}

function goBack() {
  window.history.back()
}

function goToClip() {
  navigator.clipboard.readText().then((clipText) => {
    window.location.hash = clipText
  })
}
export function TopNavbar() {
  const [inEdit, setInEdit] = useState(false)
  const urlForm = useRef<any>()
  const [urlSplit, setUrlSplit] = useState([])

  const startEdit = () => {
    setInEdit(true)
  }

  useEffect(() => {
    if (inEdit) {
      urlForm.current?.focus()
    }
  }, [inEdit])

  const exitEdit = () => {
    setInEdit(false)
  }

  const finishEdit = (e) => {
    if (e.keyCode === 13) {
      if (location.hash !== `#${e.target.value}`) {
        location.replace(`#${e.target.value}`)
        location.reload()
      }
      setInEdit(false)
    } else if (e.keyCode === 27) {
      exitEdit()
    }
  }

  const updateUrlSplit = () => {
    const hash = window.location.hash
    const theUrlSplit = hash.split('/')
    theUrlSplit.splice(0, 1)

    if (theUrlSplit[0] === 'watch') {
      const pagePerm = theUrlSplit[1]
      const pagePermSpliced = pagePerm.split(':')
      pagePermSpliced.splice(0, 1)
      theUrlSplit.pop()
      pagePermSpliced.forEach((onePagePerm) => {
        theUrlSplit.push(onePagePerm)
      })

      setUrlSplit(theUrlSplit)
    } else {
      setUrlSplit(theUrlSplit)
    }
  }

  useEffect(() => {
    updateUrlSplit()
  }, [])

  useEffect(() => {
    window.addEventListener('hashchange', function (event) {
      updateUrlSplit()
    })
  }, [])

  const userProfileUrl = useMemo(() => {
    const windowLocationHash = window.location.hash
    const windowLocationSearch = windowLocationHash.search('#')
    const windowLocationHref = windowLocationHash.slice(windowLocationSearch)
    const hrefSegments = windowLocationHref.split('/')
    hrefSegments.splice(0, 1)

    let userProfileUrl = '#/user/'

    if (hrefSegments[0] === 'watch') {
      const userProfileUrlInit = hrefSegments[1]
      const userProfileUrlSpliced = userProfileUrlInit.split(':')
      userProfileUrlSpliced.pop()

      userProfileUrlSpliced.forEach((one) => {
        if (one === userProfileUrlSpliced[0]) {
          userProfileUrl = userProfileUrl + one + ':'
        } else {
          userProfileUrl = userProfileUrl + one
        }
      })
    }

    return userProfileUrl
  }, [])

  return (
    <div>
      <Navbar bg="light" expand="lg">
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            {!inEdit ? (
              <>
                <Breadcrumb>
                  <Breadcrumb.Item href="#/">Home</Breadcrumb.Item>
                  {urlSplit.map((el) =>
                    el === updateUrlSplit[1] && updateUrlSplit[0] === 'watch' ? (
                      <Breadcrumb.Item href={userProfileUrl} key={el} id={el}>
                        {el}
                      </Breadcrumb.Item>
                    ) : (
                      <Breadcrumb.Item href={'#'} key={el} id={el}>
                        {el}
                      </Breadcrumb.Item>
                    ),
                  )}
                </Breadcrumb>
                <Button
                  className="btn btn-light btn-sm"
                  style={{
                    marginLeft: '5px',
                    width: '40px',
                    height: '40px',
                    padding: '3.5%',
                    verticalAlign: 'baseline',
                  }}
                  onClick={startEdit}
                >
                  <FaEdit style={{ textAlign: 'center', verticalAlign: 'initial' }} />
                </Button>
              </>
            ) : (
              <FormControl
                ref={urlForm}
                defaultValue={(() => {
                  return location.hash.slice(1)
                })()}
                onKeyDown={finishEdit}
                onBlur={exitEdit}
              />
            )}
          </Nav>
          <Dropdown>
            <Dropdown.Toggle variant="secondary" size="lg">
              Options
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item onClick={() => copyToClip(window.location.hash)}>
                Copy Current URL{' '}
                <FaCopy size={28} onClick={() => copyToClip(window.location.hash)} />
              </Dropdown.Item>
              <Dropdown.Item onClick={goToClip}>
                Go to Copied URL <FaArrowRight size={28} />
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Nav>
            <Nav.Link>
              <FaAngleLeft size={28} onClick={goBack} />
            </Nav.Link>
            <Nav.Link>
              <FaAngleRight size={28} onClick={goForth} />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </div>
  )
}
