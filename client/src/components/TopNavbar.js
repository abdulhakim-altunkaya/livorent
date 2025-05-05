import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserId } from './utilsAuth';
import "../styles/Search.css"; 

function TopNavbar() {
  const userIdData = getUserId(); // This returns an object { userNumber }
  const myNum = userIdData.userNumber; // Get the actual number
  
  const navigate = useNavigate();

  const [searchText, setSearchText] = useState("");
  const [isSearchLocked, setSearchLocked] = useState(false);//prevent spam search attempts
  const handleSearch = () => {
    const searchText2 = searchText.trim()
    if (searchText2.length < 3 || !/[a-zA-Z0-9]/.test(searchText2)) {//search inputs such as ? ! etc wont be accepted.
      alert("Lūdzu, ievadiet vismaz 3 derīgas rakstzīmes (burti vai cipari).");
      return; //search inputs must be at least 3 characters.
    }
    if (isSearchLocked) {
      return;
    };
    setSearchLocked(true);
    navigate(`/search?query=${encodeURIComponent(searchText2)}`);
    setTimeout(() => setSearchLocked(false), 2000); //repeated search can be done after 3 seconds to prevent spam.
  }

  return (
    <div className='TopNavbarArea'>
      <div className='topTitleArea'>
        <header className='headerArea'><span onClick={ () => navigate("/")}>LIVORENT</span></header>
      </div>
      <span className='topAreaNavSpans' onClick={() => navigate("/upload")}>Iesniegt Sludinājumu</span>

      <span className='topAreaNavSpans searchArea'>
        <input id="searchAreaInput" type="text" placeholder="Meklēšana" 
          value={searchText} onChange={(e) => setSearchText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}/>
        <img id='searchIcon' src='/svg_search.svg' alt='search icon'/>
      </span>

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