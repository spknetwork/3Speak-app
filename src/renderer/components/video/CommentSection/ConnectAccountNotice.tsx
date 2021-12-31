import React from 'react'

export function ConnectAccountNotice() {
  return (
    <p className="alert alert-info">
      To comment on this video please connect a HIVE account to your profile: &nbsp;
      <a href="#/login" className="keychainify-checked">
        Connect HIVE Account
      </a>
    </p>
  )
}
