import React from 'react';
import { useNavigate } from 'react-router-dom';

function TopNavbar() {
  const navigate = useNavigate();

  return (
    <div className='TopNavbarArea'>
      <span onClick={() => navigate("/upload")}>Iesniegt Sludinājumu</span>
      <span onClick={() => navigate("/")}>Meklēšana</span>
      <span onClick={() => navigate("/")}>Jautājumi&Atbildes</span>
      <span onClick={() => navigate("/")}>Kontakti</span>
    </div>
  )
}

export default TopNavbar;