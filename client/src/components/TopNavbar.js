import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserId } from './utilsAuth';
import { setUserData } from './utilsAuth';
import "../styles/Search.css"; 

function TopNavbar() { 
  const navigate = useNavigate(); 

  const [myNum, setMyNum] = useState(0);
  const [userAllData, setUserAllData] = useState(null);

  useEffect(() => { 
    const userIdData = getUserId(); // This returns an object { userNumber }
    if (userIdData.userNumber > 0) { 
      setMyNum(userIdData.userNumber); // Get the actual number
      const fetchUserData = async () => {
        const userData = await setUserData();
        setUserAllData(userData);
        if (userData.userNumber < 1) {  
          setMyNum(0);
        }
      };
      fetchUserData();
    }
  }, []);
  //keep below useEffect so that the code wont break in case answer from db takes time.
  useEffect(() => {
    if (userAllData) {
      console.log("Authenticated user Data:", userAllData.userNumber);
    }
  }, [userAllData]);

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
    <>
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
          <img id='searchIcon' onClick={handleSearch} src='/svg_search.svg' alt='search icon'/>
        </span>

        <span className='topAreaNavSpans' onClick={() => navigate("/about")}>Kontakti</span>

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
      <div className='TopNavbarAreaSmall'>
        <div className='topTitleArea'>
          <header className='headerArea'><span onClick={ () => navigate("/")}>LIVORENT</span></header>
          {
            myNum > 0 ?
            (<div className='topAreaLoginArea' onClick={() => navigate(`/profile/${myNum}`)} title='Mans profils'>
              <img className='profileIcon' src='/svg_profile1.svg' alt='Profile icon'/>
            </div>)     
            :  
            (<div className='topAreaLoginArea' onClick={() => navigate("/login")}>
              <img className='loginIcon' src='/svg_login.svg' alt='Login icon'/>
            </div>)
          }
        </div>
        <div className='addSearchAreaSmall'>
          <span className='addButton' onClick={() => navigate("/upload")}>&#10133; Iesniegt</span>

          <span className='searchArea'>
            <input id="searchAreaInput" type="text" placeholder="Meklēšana" 
              value={searchText} onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}/>
          </span>
        </div>

      </div>
    </>

  )
}

export default TopNavbar;