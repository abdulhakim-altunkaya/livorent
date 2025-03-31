import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserId, getUserDetails } from './utilsAuth';

function TopNavbar() {
  const userIdData = getUserId(); // This returns an object { userNumber }
  const myNum = userIdData.userNumber; // Get the actual number
  const myNum2 = getUserDetails();
  
  console.log("User ID:", myNum); // Now this will log the number
  console.log("User Details:", myNum2);
  const navigate = useNavigate();

  return (
    <div className='TopNavbarArea'>
      <div className='topTitleArea'>
        <header className='headerArea'><span onClick={ () => navigate("/")}>LIVORENT</span></header>
      </div>
      <span className='topAreaNavSpans' onClick={() => navigate("/upload")}>Iesniegt Sludinājumu</span>
      <span className='topAreaNavSpans' onClick={() => navigate("/")}>Meklēšana</span>
      <span className='topAreaNavSpans' onClick={() => navigate("/")}>Kontakti</span>
      {
        myNum > 0 ?
        (<div className='topAreaLoginArea' onClick={() => navigate(`/profile/${myNum}`)} title='Mans profils'>
          <img className='profileIcon' src='/svg_profile1.svg' alt='Profile icon'/>
        </div>)     
        :  
        (<div className='topAreaLoginArea' onClick={() => navigate("/login")}>
          <img className='loginIcon' src='/svg_login.svg' alt='Login icon'/>
          <div>Ieiet</div>
        </div>)
      }

    </div>
  )
}

export default TopNavbar;