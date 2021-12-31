import React, { useEffect } from 'react'
import { Container, Row } from 'react-bootstrap'

export function CreatorStudioView() {
  useEffect(() => {
    document.title = '3Speak - Tokenised video communities'
  }, [])
  return (
    <Container fluid>
      <Row>
        <webview
          id="foo"
          src="https://studio.3speak.tv"
          style={{ width: '100%', height: '600px' }}
        ></webview>
      </Row>
    </Container>
  )
}
