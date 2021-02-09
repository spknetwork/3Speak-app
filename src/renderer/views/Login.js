import React, {Component} from 'react';
import {Button, Form} from "react-bootstrap";
import {faSpinner} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

class Login extends Component {
    faSpinner;
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            key: '',
            profile: '',
            isOpen: false,
            submit: 'Submit',
            encryption: false,
            symKey: ''
        }
        this.submitRef = React.createRef()
    }

    handleSubmit(event) {
        event.preventDefault()

        let login = {
            'username': this.state.username,
            'key': this.state.key,
            'profile': this.state.profile,
        }

        this.submitRef.current.setAttribute('disabled', 'disabled')
        this.setState({submit: <FontAwesomeIcon icon={faSpinner} spin />})
        this.resetForm()

        //TODO: backend

        this.setState({submit: 'Submit'})
        this.submitRef.current.removeAttribute('disabled')
    }

    resetForm(){
        this.setState({username: '', key: ''})
    }

    onUsernameChange(event) {
        this.setState({username: event.target.value})
    }

    onKeyChange(event) {
        this.setState({key: event.target.value})
    }

    onProfileChange(event) {
        this.setState({profile: event.target.value})
    }

    onEncryptionChange(event) {
        console.log(event.target.checked)
        this.setState({encryption: event.target.checked})
    }

    onSymKeyChange(event) {
        this.setState({symKey: event.target.value})
    }

    render() {
        return(
            <>
                <Form id="contact-form" onSubmit={(event) => {this.handleSubmit(event)}} style={{'maxWidth': '600px', 'width': '100%', 'padding': '20px', 'alignItems': 'center'}}>
                    <div className='p-3' style={{width: '100%'}}>
                        <Form.Group>
                            <Form.Label className='text-secondary'>Profile name</Form.Label>
                            <Form.Control type="text" value={this.state.profile} onChange={this.onProfileChange.bind(this)} className='bg-secondary text-light' />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className='text-secondary'>Username</Form.Label>
                            <Form.Control type="text" value={this.state.username} onChange={this.onUsernameChange.bind(this)} className='bg-secondary text-light' />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className='text-secondary'>Hive Private Posting Key</Form.Label>
                            <Form.Control type="password" value={this.state.key} onChange={this.onKeyChange.bind(this)} className='bg-secondary text-light' />
                        </Form.Group>
                        <label className='text-secondary mr-2' for='enable-encryption'>Enable Encryption</label>
                        <input name='enable-encryption' type="checkbox" checked={this.state.encryption} onChange={this.onEncryptionChange.bind(this)} />
                        {this.state.encryption && (
                            <Form.Group>
                                <Form.Label className='text-secondary'>Symmetric Key</Form.Label>
                                <Form.Control type="text" value={this.state.symKey} onChange={this.onSymKeyChange.bind(this)} className='bg-secondary text-light' />
                            </Form.Group>
                        )}
                        <br />
                        <span className='tag-wrap'>
                            <Button type="submit" ref={this.submitRef} variant='secondary'>{this.state.submit}</Button>
                        </span>
                    </div>
                </Form>
            </>
        )
    }
}

export default Login