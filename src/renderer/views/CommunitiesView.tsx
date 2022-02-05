import React, { useEffect, useState } from 'react'
import { Button, Container, Row } from 'react-bootstrap'
import { CommunityTile } from '../components/widgets/CommunityTile'

const { Client: HiveClient } = require('@hiveio/dhive')
const client = new HiveClient('https://api.openhive.network')

export function CommunitiesView() {
  const [data, setData] = useState([])

  const generate = async () => {
    const res = await client.call('bridge', 'list_communities', {
      last: '',
      limit: 100,
    })
    setData(res)
  }
  useEffect(() => {
    document.title = '3Speak - Tokenised video communities'
    generate()
  }, [])
  return (
    <Container fluid>
      <Row>
        <div className="col-12">
          <h3 style={{ display: 'inline-block' }}>Communities</h3>
          <span className="float-right mb-3">
            <Button id="communityCreate" variant="primary" disabled>
              Create +
            </Button>
          </span>
        </div>
      </Row>
      <Row>
        {data.map((value) => (
          <CommunityTile key={value.name} reflink={`hive:${value.name}`} info={value} />
        ))}
      </Row>
    </Container>
  )
}
