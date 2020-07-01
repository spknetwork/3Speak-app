import React, { Component } from 'react';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';


class Collapsible extends Component {
    constructor(props) {
        super(props);
        this.state = { collapsed: true};

        this.handleClick = this.handleClick.bind(this)
    }
    handleClick(e) {
        if(this.state.collapsed) {
            this.setState({
                collapsed: false
            })
        } else {
            this.setState({
                collapsed: true
            })
        }
    }
    render() { 
        return ( <React.Fragment>
            <div style={{maxHeight: this.state.collapsed ? "200px" : "initial", overflow: "hidden"}}>
                {this.props.children}
            </div>
            <div className="text-center" onClick={this.handleClick} id="videoAboutCollapse" style={{cursor: "pointer", borderTop: "1px solid rgba(0,0,0,0.2)"}}> 
                {
                    this.state.collapsed ? <FaChevronDown/> : <FaChevronUp/>
                }
                {
                    this.state.collapsed ? "Show more" : "Show less"
                }
            </div>
        </React.Fragment> );
    }
}
 
export default Collapsible;