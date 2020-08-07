import React from 'react';
import VideoWidget from "../components/video/VideoWidget";

class GridFeed extends React.Component {
    constructor() {
        super();
        this.state = { data: [] };
    }

    componentDidMount() {
        fetch(`https://3speak.online/apiv2/feeds/${this.props.type}`)
            .then(res => res.json())
            .then(json => {
                this.setState({data: json})
            })
    }

    render() {
        return (
                <div className='row'>
                {this.state.data.map(el => (
                    <VideoWidget key={el.author + '/' + el.permlink} reflink={`hive:${el.author}:${el.permlink}`} {...el} />
                ))}
                </div>
        );
    }
}

export default GridFeed