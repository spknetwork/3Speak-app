import React, { useEffect, useRef, useState } from 'react'
import { Button, Table } from 'react-bootstrap'

import { bytesAsString } from '../../../common/utils/unit-conversion.functions'
import { IpfsHandler } from '../../../main/core/components/ipfsHandler'

// import byteSize from 'byte-size'
const { shell } = require('electron')

export function IpfsStatsView() {
  const [stats, setStats] = useState({} as any)
  const [repoSize, setRepoSize] = useState('')
  const [repoPath, setRepoPath] = useState('')
  const loopPid = useRef<any>()

  const update = async () => {
    const { ipfs } = await IpfsHandler.getIpfs()
    const out = {}
    for await (const theStats of ipfs.stats.bw()) {
      for (const key of Object.keys(theStats)) {
        const stat = Number(theStats[key])
        out[key] = bytesAsString(stat)
      }
    }
    const repoRes = await ipfs.stats.repo()
    setRepoPath(repoRes.path)
    setRepoSize(bytesAsString(Number(repoRes.repoSize)))
    setStats(out)
  }

  useEffect(() => {
    loopPid.current = setInterval(update, 500)

    return () => {
      clearInterval(loopPid.current)
    }
  }, [])

  return (
    <Table responsive="sm">
      <thead>
        <tr>
          <th>#</th>
          <th>In</th>
          <th>Out</th>
          <th>Total In</th>
          <th>Total Out</th>
        </tr>
      </thead>
      <tbody>
        <tr key="Main">
          <td></td>
          <td>
            <strong>{stats.rateIn} /s</strong>
          </td>
          <td>
            <strong>{stats.rateOut} /s</strong>
          </td>
          <td>
            <strong>{stats.totalIn}</strong>
          </td>
          <td>
            <strong>{stats.totalOut}</strong>
          </td>
        </tr>
        ,
      </tbody>
      <thead>
        <tr>
          <th>#</th>
          <th>Repo Size</th>
          <th>Repo Path</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th></th>
          <th>{repoSize}</th>
          <th>
            {repoPath}
            <Button
              style={{ marginLeft: '5px' }}
              className="btn-sm"
              onClick={() => {
                void shell.openPath(repoPath)
              }}
            >
              Open
            </Button>
          </th>
        </tr>
      </tbody>
    </Table>
  )
}
