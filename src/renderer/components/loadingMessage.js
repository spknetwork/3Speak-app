import React from 'react'
import {LoopCircleLoading} from 'react-loadingg';

export default function loadingMessage(props) {
    return (<div>
        <LoopCircleLoading />
        <center style={{ margin: "auto", position: "absolute", left: "0px", right: "0px", top: "60%", bottom: "0px" }}>
            <h1 style={{ top: "60%", fontSize: "20px" }}>{props.loadingMessage}</h1>
        </center>
    </div>)
}