import 'brace/mode/json'
import 'brace/theme/github'
import 'brace/theme/monokai'
import 'brace/theme/solarized_dark'
import 'jsoneditor-react/es/editor.min.css'

import ace from 'brace'
import { JsonEditor as Editor } from 'jsoneditor-react'
import React, { useEffect, useRef, useState } from 'react'
import { Button, ButtonGroup, Col, Row } from 'react-bootstrap'
import { NotificationManager } from 'react-notifications'

import { IpfsHandler } from '../../main/core/components/ipfsHandler'
import { IpfsStatsView } from './IpfsConsoleView/IpfsStatsView'

//JSON editor specific
export function IpfsConsoleView() {
  const [ipfsConfig, setIpfsConfig] = useState({} as any)
  const [ipfsInfo, setIpfsInfo] = useState({} as any)
  const [configError, setConfigError] = useState(false)
  const editor = useRef<any>()
  const loopPid = useRef<any>()

  const getIpfsConfig = async () => {
    const info = await IpfsHandler.getIpfs()
    setIpfsInfo(info)

    let jsonContent
    const { ipfs } = info

    if (editor.current) {
      editor.current?.createEditor({
        value: await ipfs.config.getAll(),
        ace: ace,
        mode: 'code',
        theme: 'ace/theme/solarized_dark',
        ref: editor,
        htmlElementProps: {
          style: {
            height: '500px',
          },
        },
        onChange: (json) => {
          jsonContent = json
        },
      })
    } else {
      throw new Error(`editor ref is not defined!  Cannot create editor.`)
    }
  }

  const update = async () => {
    console.log(`UPDATING`)
    const annotations = editor.current.jsonEditor.aceEditor.getSession().getAnnotations()
    setConfigError(annotations.length === 0 ? false : true)
  }

  useEffect(() => {
    void getIpfsConfig()
    loopPid.current = setInterval(update, 150)

    return () => {
      clearInterval(loopPid.current)
    }
  }, [])

  return (
    <div style={{ padding: '5px', overflow: 'hidden' }}>
      <h3>
        This is the IPFS Debug Console. This is for advanced users only, if you don't know what you
        are doing stay out of this area.
      </h3>
      <div style={{ overflow: 'show' }}>
        <Row>
          <Col style={{ background: '#f8f9fa', margin: '5px' }}>
            <Editor
              value={ipfsConfig}
              ace={ace}
              mode="code"
              theme="ace/theme/solarized_dark"
              ref={editor}
              htmlElementProps={{
                style: {
                  height: '560px',
                },
              }}
              onChange={(json) => {
                console.log(json)
              }}
            />
            <ButtonGroup>
              <Button
                variant="success"
                onClick={async () => {
                  try {
                    const jsonContent = editor.current.jsonEditor.get()
                    NotificationManager.success('IPFS config saved')
                    await ipfsInfo.ipfs.config.replace(jsonContent)
                  } catch (ex) {
                    console.error(ex)
                  }
                }}
                disabled={configError}
              >
                Save
              </Button>
            </ButtonGroup>
          </Col>
          <Col style={{ background: '#f8f9fa', margin: '5px' }}>
            <IpfsStatsView />
          </Col>
        </Row>
        <Row>
          <Col style={{ background: '#f8f9fa', margin: '5px' }}></Col>
          <Col style={{ background: '#f8f9fa', margin: '5px' }}></Col>
        </Row>
      </div>
    </div>
  )
}
