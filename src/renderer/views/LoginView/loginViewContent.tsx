import { Button, Dropdown, Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import React from 'react'
const LoginViewContent = ({
                            handleSubmit,
                            accountType,
                            setAccountType,
                            profile,
                            username,
                            onProfileChange,
                            onUsernameChange,
                            submitting,
                            encryption,
                            onEncryptionChange,
                            symKey,
                            onSymKeyChange,
                            key,
                            onKeyChange,
                            submitRef,
                             }) => {
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
        <Form.Label className="text-secondary">Profile name</Form.Label>
        <Form.Control
          type="text"
          value={profile}
          onChange={onProfileChange}
          className="bg-secondary text-light"
          disabled
          required
        />
      </Form.Group>
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
      <Form.Label className="text-secondary">Profile name</Form.Label>
      <Form.Control
        type="text"
        value={profile}
        onChange={onProfileChange}
        className="bg-secondary text-light"
        required
      />
    </Form.Group>
    <Form.Group>
      <Form.Label className="text-secondary">Username</Form.Label>
      <Form.Control
        type="text"
        value={username}
        onChange={onUsernameChange}
        className="bg-secondary text-light"
        required
      />
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
export default LoginViewContent;