import 'brace/mode/json'
import 'brace/theme/github'
import 'jsoneditor-react/es/editor.min.css'

import React from 'react'

export const CustomPinsViewToggle = React.forwardRef(({ children, onClick }: any, ref: any) => (
  <a
    href=""
    ref={ref}
    onClick={(e) => {
      e.preventDefault()
      onClick(e)
    }}
  >
    {children}
  </a>
))
