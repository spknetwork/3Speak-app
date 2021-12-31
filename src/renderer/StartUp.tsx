import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import PromiseIpc from 'electron-promise-ipc'
import './css/Startup.css'

export function StartUp(props: any) {
  const [show, setShow] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const load = async () => {
      const backendStatus = (await PromiseIpc.send('core.status', undefined as any)) as any
      if (backendStatus.ready === false) {
        setShow(true)
        const pid = setInterval(async () => {
          const status = (await PromiseIpc.send('core.status', undefined as any)) as any
          setMessage(status.start_progress.message)
        }, 25)
        PromiseIpc.send('core.ready', undefined as any).then((eda) => {
          setShow(false)
          clearInterval(pid)
        })
      }
    }

    void load()
  }, [])

  return (
    <div>
      <Modal show={show} backdrop={'static'} backdropClassName={'start-backdrop'}>
        <Modal.Header>
          <Modal.Title>App Starting Up</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ paddingTop: '50px' }}>Loading</h1>
            <hr />
            <p style={{ fontSize: '15px' }}>{message}</p>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  )
}
