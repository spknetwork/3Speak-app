import React from 'react'

import NotFoundIMG from '../../renderer/assets/img/404.png'

export function NotFoundView() {
  return (
    <div>
      <div style={{ textAlign: 'center' }}>
        <img src={NotFoundIMG} />
        <h3>SORRY! PAGE NOT FOUND.</h3>
        Unfortunately the page you are looking for has been moved or deleted.
        <br />
        <br />
        <a className="btn btn-outline-primary" href="#/">
          {' '}
          GO TO HOME PAGE
        </a>
      </div>
    </div>
  )
}
