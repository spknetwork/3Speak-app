import React, { useState } from 'react'
import { FaChevronUp, FaChevronDown } from 'react-icons/fa'

export function CollapsibleText(props: any) {
  const [collapsed, setCollapsed] = useState(true)

  const handleClick = (e) => {
    setCollapsed(!collapsed)
  }

  return (
    <>
      <div
        style={{
          maxHeight: collapsed ? '200px' : 'initial',
          overflow: 'hidden',
        }}
      >
        {props.children}
      </div>
      <div
        className="text-center"
        onClick={handleClick}
        id="videoAboutCollapse"
        style={{ cursor: 'pointer', borderTop: '1px solid rgba(0,0,0,0.2)' }}
      >
        {collapsed ? <FaChevronDown /> : <FaChevronUp />}
        {collapsed ? 'Show more' : 'Show less'}
      </div>
    </>
  )
}
