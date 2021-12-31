import React, { useEffect, useState } from 'react'
import { Row, Col, Container } from 'react-bootstrap'
import axios from 'axios'
import { LeaderTile } from '../components/widgets/LeaderTile'

export function LeaderboardView() {
  const [first, setFirst] = useState<any>()
  const [second, setSecond] = useState<any>()
  const [third, setThird] = useState<any>()
  const [bronze, setBronze] = useState<any[]>([])

  useEffect(() => {
    document.title = '3Speak - Tokenised video communities'
    void load()

    async function load() {
      const data = (await axios.get('https://3speak.tv/apiv2/leaderboard')).data
      let step = 1
      for (const ex of data) {
        if (step >= 30) {
          break
        }
        if (step === 1) {
          setFirst(ex)
        } else if (step === 2) {
          setSecond(ex)
        } else if (step === 3) {
          setThird(ex)
        } else {
          setBronze([...bronze, ex])
        }
        step++
      }
    }
  }, [])

  useEffect(() => {
    console.log(`first is now `, first)
  }, [first])

  return (
    <div>
      <div className="header_sec">
        <Container fluid className="header_sec">
          <div className="row">
            <div className="col-lg-6 col-md-6 col-xs-12 header_dist1">
              <h1 className="white_col">Content Creator Leaderboard</h1>
            </div>
          </div>
        </Container>
      </div>
      <section className="content_home">
        <Container fluid>
          <Row className="justify-content-md-center">
            <div className="col-xl-8 col-sm-8 col-12 mb-3">
              {first && <LeaderTile info={first} reflink={`hive:${first.username}`} />}
            </div>
          </Row>
          <Row className="justify-content-md-center">
            <div className="col-xl-5 col-sm-8 col-12 mb-3">
              {second ? <LeaderTile info={second} reflink={`hive:${second.username}`} /> : null}
            </div>
            <div className="col-xl-5 col-sm-8 col-12 mb-3">
              {third ? <LeaderTile info={third} reflink={`hive:${third.username}`} /> : null}
            </div>
            <Row>
              {bronze.map((value) => (
                <div key={value.username} className="col-xl-2 col-sm-4 mb-3">
                  <LeaderTile info={value} reflink={`hive:${value.username}`} />
                </div>
              ))}
            </Row>
          </Row>
        </Container>
      </section>
    </div>
  )
}
