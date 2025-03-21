import React from 'react';
import { useNavigate } from 'react-router-dom';

function TopNavbar() {
  const navigate = useNavigate();

  return (
    <div className='TopNavbarArea'>
      <div className='topTitleArea'>
        <header className='headerArea'><span onClick={ () => navigate("/")}>LIVORENT</span></header>
      </div>
      <span className='topAreaNavSpans' onClick={() => navigate("/upload")}>Iesniegt Sludinājumu</span>
      <span className='topAreaNavSpans' onClick={() => navigate("/")}>Meklēšana</span>
      <span className='topAreaNavSpans' onClick={() => navigate("/")}>Kontakti</span>
      <div className='topAreaLoginArea' onClick={() => navigate("/login")}>
        <img src='/svg_login.svg' alt='Login icon'/>
        <div>Ieiet</div>
      </div>
    </div>
  )
}

export default TopNavbar;