import React from 'react';
import TopNavbar from "./TopNavbar";
import TopTitle from "./TopTitle";
import "../styles/TopArea.css";

function Top() {
  return (
    <div className='topMainArea'>
      <TopTitle />
      <TopNavbar />
    </div>
  )
}

export default Top