// Path: src\renderer\views\PinsView\PinsViewComponent.tsx
import React from 'react'
import { Button, Col, Dropdown, Row, Table } from 'react-bootstrap'
import { CustomPinsViewToggle } from './CustomToggle'
import { CustomPinsViewMenu } from './CustomMenu'
import DateTime from 'date-and-time'
export interface PinsViewProps {
  pinRows: React.ReactNode
  showExplorer: boolean
  newVideos: any[]
  trendingVideos: any[]
  actionSelect: (key: string) => Promise<void>
  removePin: (reflink: string) => Promise<void>
  PinLocally: (cids: string[], title: string, _id: string) => Promise<void>
  setShowExplorer: (show: boolean) => void
  updateSearchTables: (community?: string, creator?: string) => Promise<void>
}

export const PinsViewComponent: React.FC<PinsViewProps> = ({
  pinRows,
  showExplorer,
  newVideos,
  trendingVideos,
  actionSelect,
  removePin,
  PinLocally,
  setShowExplorer,
  updateSearchTables,
}) => {
  return (
    <div className="container">
      <div>
        <Row>
          <Col style={{ textAlign: 'right' }}>
            <Dropdown onSelect={actionSelect}>
              <Dropdown.Toggle as={CustomPinsViewToggle} id="dropdown-custom-components">
                <Button>Actions</Button>
              </Dropdown.Toggle>

              <Dropdown.Menu as={CustomPinsViewMenu}>
                <Dropdown.Item eventKey="1">Manual Pin</Dropdown.Item>
                <Dropdown.Item eventKey="2">Manual GC</Dropdown.Item>
                <Dropdown.Item eventKey="3">IPFS Folder</Dropdown.Item>
                <Dropdown.Item eventKey="4">Change path</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>
        <Table striped bordered hover size="sm">
          <thead>
            <tr>
              <th>Reflink</th>
              <th>Title</th>
              <th>CID(s)</th>
              <th>Source</th>
              <th>Expiration</th>
              <th>Pin Date</th>
              <th>Size/Status</th>
              <th>Remove?</th>
              <th>SPoA</th>
            </tr>
          </thead>
          <tbody>{pinRows}</tbody>
        </Table>
        <Button
          onClick={() => {
            setShowExplorer(!showExplorer)
          }}
        >
          Toggle pin explorer
        </Button>
        {showExplorer && (
          <>
            <h6>Select to pin and help secure the network by backing up videos</h6>
            <input
              type="text"
              placeholder="Enter community ID..."
              onChange={(event) => {
                if (event.target.value.match(/\bhive-\d{6}\b/g)) {
                  updateSearchTables(event.target.value, null)
                }
              }}
            />
            <input
              type="text"
              placeholder="Enter a username"
              onChange={(event) => {
                updateSearchTables(null, event.target.value)
              }}
            />
            <Row>
              {['new', 'trending'].map((type: 'new' | 'trending') => (
                <Col key={type}>
                  <Table striped bordered hover size="sm">
                    <thead>
                      <tr>
                        <th>{type} videos</th>
                        <th>Title</th>
                        <th>Creator</th>
                        <th>pinned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* {this.state[`${type}Videos`].map((video) => ( */}
                      {(type === 'new' ? newVideos : trendingVideos).map((video) => (
                        <tr key={`${type}-${video.author}-${video.permlink}`}>
                          <td>
                            <div className="teaser_holder video-card-image">
                              <div className="card-label">
                                {(() => {
                                  const pattern = DateTime.compile('mm:ss')
                                  return DateTime.format(new Date(video.duration * 1000), pattern)
                                })()}
                              </div>
                              <a href={`#/watch/hive:${video.author}:${video.permlink}`}>
                                <img
                                  className="img-fluid bg-dark"
                                  src={video.images.thumbnail}
                                  alt=""
                                />
                              </a>
                            </div>
                          </td>
                          <td>{video.title}</td>
                          <td>{video.author}</td>
                          <td>
                            {video.isPinned ? (
                              <Button
                                variant="danger"
                                onClick={async () => {
                                  await removePin(video.id)
                                  updateSearchTables()
                                }}
                              >
                                X
                              </Button>
                            ) : (
                              <Button
                                variant="success"
                                onClick={async () => {
                                  await PinLocally([video.ipfs], video.title, video.id)
                                  updateSearchTables()
                                }}
                              >
                                O
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Col>
              ))}
            </Row>
          </>
        )}
      </div>
    </div>
  )
}
