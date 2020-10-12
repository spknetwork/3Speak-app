import React, { Component } from 'react';
import NotFoundIMG from '../../renderer/assets/img/404.png'
class NotFound extends Component {
    constructor(props) {
        super(props);
        this.state = {  }
    }
    render() { 
        return ( <div>
            <center>
                <img src={NotFoundIMG}/>
                <h3>
                    SORRY! PAGE NOT FOUND.
                </h3>
                Unfortunately the page you are looking for has been moved or deleted. 
                <br/>
                <br/>
                <a class="btn btn-outline-primary" href="#/"> GO TO HOME PAGE</a>
            </center>
        </div> );
    }
}
 
export default NotFound;