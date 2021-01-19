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
            isOpen: false,
            submit: 'Submit'
        }
        this.submitRef = React.createRef()
    }

    handleSubmit(event) {
        event.preventDefault()

        let login = {
            'username': this.state.username,
            'key': this.state.key
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

    render() {
        return(
            <>
                <Form id="contact-form" onSubmit={(event) => {this.handleSubmit(event)}} style={{'maxWidth': '600px', 'width': '100%', 'padding': '20px', 'alignItems': 'center'}}>
                    <div className='p-3' style={{width: '100%'}}>
                        <Form.Group>
                            <Form.Label className='text-secondary'>Username</Form.Label>
                            <Form.Control type="text" value={this.state.username} onChange={this.onUsernameChange.bind(this)} className='bg-secondary text-light' />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label className='text-secondary'>Hive Private Active Key</Form.Label>
                            <Form.Control type="password" value={this.state.key} onChange={this.onKeyChange.bind(this)} className='bg-secondary text-light' />
                        </Form.Group>
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