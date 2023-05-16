import React from 'react';
import { FaCogs } from 'react-icons/fa';
export const CustomToggle = React.forwardRef<any, any>(({ children, onClick }, ref) => (
  <button
    style={{ float: 'right' }}
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    className="btn btn-sm dropdown-toggle btn-secondary"
    id="videoOptions"
    type="button"
    data-toggle="dropdown"
  >
    <FaCogs />
  </button>
));
