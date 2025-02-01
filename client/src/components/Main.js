import React from 'react';
import Top from "./Top";
import Bottom from "./Bottom";
import "../styles/Main.css";

function Main() {
  return (
    <div className='mainArea'>
        <Top />
        <Bottom />
    </div>
  )
}

export default Main