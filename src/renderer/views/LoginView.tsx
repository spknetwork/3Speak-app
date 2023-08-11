import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useCallback, useRef, useState, useEffect } from 'react'
import { Button, Dropdown, Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { NotificationManager } from 'react-notifications'
import { useHistory } from 'react-router-dom'

import { AccountService } from '../services/account.service'

export function LoginView() {
  const submitRef = useRef<any>()
  const [username, setUsername] = useState('')
  const [key, setKey] = useState('')
  const [profile, setProfile] = useState('')
  const [encryption, setEncryption] = useState(false)
  const [symKey, setSymKey] = useState('')
  const [accountType, setAccountType] = useState('hive')
  const [submitting, setSubmitting] = useState(false)
  const history = useHistory()

  const resetForm = () => {
    console.log(`resetting form`)
    setUsername('')
    setKey('')
  }
  useEffect(() => {
    const load = async () => {
      const login = localStorage.getItem('SNProfileID')
      const accountsInit = (await AccountService.getAccounts()) as any[]
      if (login && accountsInit.length > 0) {
        history.push('/')
      }
    }

    void load()
  }, [])

  const onUsernameChange = useCallback(async (event) => {
    console.log(`username change ${event.target.value}`)
    setUsername(event.target.value)
  }, [])

  const onKeyChange = useCallback(async (event) => {
    setKey(event.target.value)
  }, [])

  const onProfileChange = useCallback(async (event) => {
    setProfile(event.target.value)
  }, [])

  const onEncryptionChange = useCallback(async (event) => {
    setEncryption(event.target.checked)
  }, [])

  const onSymKeyChange = useCallback(async (event) => {
    setSymKey(event.target.value)
  }, [])

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault()

      const login = {
        username,
        key,
        accountType,
        symKey,
        isEncrypted: encryption,
      }

      setSubmitting(true)

      submitRef?.current?.setAttribute('disabled', 'disabled')

      try {
        const loginHandler = (await AccountService.login(login)) as any
        console.log(loginHandler)

        if (loginHandler.nickname === login.username) {
          window.location.reload()
        } else {
          console.log({ loginHandler, response: 'unsucessful' })
        }
      } catch (ex) {
        NotificationManager.error(ex.toString())
        throw ex
      }

      setSubmitting(false)
      resetForm()
      submitRef.current.removeAttribute('disabled')
    },
    [username, key, profile, accountType, symKey, encryption],
  )

  return (
    <>
      <Form
        id="contact-form"
        onSubmit={(event) => {
          void handleSubmit(event)
        }}
        style={{
          maxWidth: '600px',
          width: '100%',
          padding: '20px',
          alignItems: 'center',
        }}
      >
        <div className="p-3" style={{ width: '100%' }}>
          <Form.Label className="text-secondary">Account type</Form.Label>
          <Dropdown className="mb-2">
            <Dropdown.Toggle variant="secondary">{accountType}</Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item
                onClick={() => {
                  setAccountType('hive')
                }}
              >
                Hive
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  setAccountType('IDX')
                }}
              >
                IDX
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  setAccountType('other')
                }}
              >
                Other
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          {accountType !== 'hive' ? (
            <OverlayTrigger
              placement={'top'}
              overlay={<Tooltip id="coming-soon">Disabled (Coming Soon!)</Tooltip>}
            >
              <div>
                <Form.Group>
                  <Form.Label className="text-secondary">Username</Form.Label>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={onUsernameChange}
                    className="bg-secondary text-light"
                    disabled
                    required
                  />
                </Form.Group>
              </div>
            </OverlayTrigger>
          ) : (
            <>
              <Form.Group>
                <Form.Label className="text-secondary">HIVE Username</Form.Label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: '#d1d1d1',
                      width: '45px',
                      height: '45px',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '20px',
                      borderRadius: '2px 0 0 2px',
                    }}
                  >
                    @
                  </div>
                  <Form.Control
                    type="text"
                    value={username}
                    onChange={onUsernameChange}
                    className="bg-secondary text-light"
                    style={{
                      borderRadius: '0 2px 2px 0',
                    }}
                    required
                  />
                </div>
              </Form.Group>
            </>
          )}

          {accountType === 'hive' && (
            <Form.Group>
              <Form.Label className="text-secondary">Hive Private Posting Key</Form.Label>
              <Form.Control
                type="password"
                value={key}
                onChange={onKeyChange}
                className="bg-secondary text-light"
                pattern="5[HJK][1-9A-HJ-NP-Za-km-z]{49}"
                required
              />
            </Form.Group>
          )}
          <OverlayTrigger
            placement={'top'}
            overlay={<Tooltip id="coming-soon">Disabled (Coming Soon!)</Tooltip>}
          >
            <div>
              <label className="text-secondary mr-2" htmlFor="enable-encryption">
                Enable Encryption
              </label>
              <input
                name="enable-encryption"
                type="checkbox"
                checked={encryption}
                disabled
                onChange={onEncryptionChange}
              />
            </div>
          </OverlayTrigger>

          {encryption && (
            <Form.Group>
              <Form.Label className="text-secondary">Symmetric Key</Form.Label>
              <Form.Control
                type="text"
                value={symKey}
                onChange={onSymKeyChange}
                className="bg-secondary text-light"
              />
            </Form.Group>
          )}
          <br />
          <span className="tag-wrap">
            <Button type="submit" ref={submitRef} variant="secondary">
              {submitting ? <FontAwesomeIcon icon={faSpinner as any} spin /> : 'Submit'}
            </Button>
          </span>
        </div>
      </Form>
    </>
  )
}
