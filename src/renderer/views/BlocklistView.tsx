import React, { useEffect, useState } from 'react'
import { Table, Button } from 'react-bootstrap'
import PromiseIpc from 'electron-promise-ipc'
import { NotificationManager } from 'react-notifications'

export function BlocklistView(props: any) {
  const [list, setList] = useState([])

  const generate = () => {
    PromiseIpc.send('blocklist.ls', {} as any).then((value: any) => {
      setList(value)
    })
  }

  const handleRemove = async (reflink) => {
    await PromiseIpc.send('blocklist.rm', reflink)
    NotificationManager.success(`Unblocked ${reflink}`)
    generate()
  }

  useEffect(() => {
    document.title = '3Speak - Tokenised video communities'
    generate()
  }, [])

  return (
    <div>
      <Table responsive>
        <thead>
          <tr>
            <th>Reflink</th>
            <th>Reason</th>
            <th>Remove?</th>
          </tr>
        </thead>
        <tbody>
          {list.map((value) => (
            <tr key={value._id}>
              <td>{value._id}</td>
              <td>{value.reason}</td>
              <td>
                <Button variant="danger" onClick={() => handleRemove(value._id)}>
                  X
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}
