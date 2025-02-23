import React from 'react';
import { useNavigate } from 'react-router-dom';

function TopTitle() {
  const navigate = useNavigate();
  
  return (
    <div className='topTitleArea'>
      <header className='headerArea'><span onClick={ () => navigate("/")}>LIVORENT</span></header>
    </div>
  )
}

export default TopTitle;