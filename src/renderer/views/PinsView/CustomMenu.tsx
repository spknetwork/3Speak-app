import React, { useState } from 'react'
import { FormControl } from 'react-bootstrap'

// forwardRef again here!
// Dropdown needs access to the DOM of the Menu to measure it
export const CustomPinsViewMenu = React.forwardRef(
  ({ children, style, className, 'aria-labelledby': labeledBy }: any, ref: any) => {
    const [value, setValue] = useState('')

    return (
      <div ref={ref} style={style} className={className} aria-labelledby={labeledBy}>
        <FormControl
          autoFocus
          className="mx-3 my-2 w-auto"
          placeholder="Type to filter..."
          onChange={(e) => setValue(e.target.value)}
          value={value}
        />
        <ul className="list-unstyled">
          {React.Children.toArray(children).filter(
            (child: any) => !value || child.props.children.toLowerCase().startsWith(value),
          )}
        </ul>
      </div>
    )
  },
)
