import React, { Component } from 'react';
import NotFoundIMG from '../../renderer/assets/img/404.png'
class NotFound extends Component<any,any> {
    constructor(props) {
        super(props);
        this.state = {  }
    }
    render() { 
        return ( <div>
            <div style={{textAlign: "center"}}>
                <img src={NotFoundIMG}/>
                <h3>
                    SORRY! PAGE NOT FOUND.
                </h3>
                Unfortunately the page you are looking for has been moved or deleted. 
                <br/>
                <br/>
                <a className="btn btn-outline-primary" href="#/"> GO TO HOME PAGE</a>
            </div>
        </div> );
    }
}
 
export default NotFound;