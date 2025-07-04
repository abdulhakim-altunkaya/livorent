import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import "../styles/Profile.css";
import Footer from "./Footer.js";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import useUserStore from '../store/userStore';
import { jwtDecode } from 'jwt-decode';

function BtmProfile() {
  const navigate = useNavigate() 
  const isSaving = useRef(false);  // flag to prevent repetitive requests and duplicates
  //we will check zustand store to see if there is any user data in it. If there is
  //then no need to make repetitive requests to backend and database about user information
  const cachedUserData = useUserStore(state => state.cachedUserData);

  
  const { visitorNumber } = useParams();
  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [errorFrontend, setErrorFrontend] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state
  const token = localStorage.getItem("token_livorent");

  useEffect(() => {
    //Check 1: Only people with token can open profile pages. 
    if (!token) {
      navigate("/login"); // Redirect if no token
      return;
    } 
 
    //Check 2: People with token cannot open any profile but only their profile.
    try {
      const decoded = jwtDecode(token);
      const tokenUserId = decoded.userId;

      if (String(tokenUserId) !== String(visitorNumber)) {
        navigate("/login"); 
        return;
      }
    } catch (err) {
      console.error("Invalid token:", err);
      navigate("/login");
      return;
    }
   }, [visitorNumber])
 
   useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get/adsbyuser/${visitorNumber}`);
        setMessage(response.data);  
      } catch (error) {
        setErrorFrontend("Kļūda: sludinājumi neizdevās ielādēt ❌");
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [visitorNumber, cachedUserData]);

  


  const deleteAccount = () => {
    alert("Konti, kas 6 mēnešus ir neaktīvi, tiks automātiski dzēsti ❌");
    return;
  }

  const signoutAccount = () => {
    localStorage.removeItem("token_livorent");
    localStorage.removeItem("visitorNumber");
    // Delay clearing cachedUserData to allow redirect to happen first
    setTimeout(() => {
      useUserStore.getState().setCachedUserData(null);
    }, 200); // 100ms is enough; adjust if needed
    //navigate("/");//we dont use navigate because zustand old user number will persist after navigate.
    window.location.href = "/";//we use navigate that zustand old user number will reset to zero.
  }

  const deleteAd = async (n) => {
    // This will show a browser confirmation dialog with OK/Cancel buttons
    const adNumber = Number(n)
      // Check if n is a valid number
    if (!adNumber || isNaN(adNumber)) {
      setErrorFrontend("Nederīgs sludinājuma ID ❌");
      return;
    }
    // Check if user is authenticated
    if (!token) {
      setErrorFrontend("Nepieciešama autorizācija ❌");
      return;
    }

    const userConfirmed = window.confirm(
      "Vai vēlaties turpināt?"
    );
    //userConfirmed means user confirmed delete operation.
    if (userConfirmed) {
      // prevent duplicates
      if (isSaving.current) return; 
      isSaving.current = true;
      try {
        // Get current state before deletion
        const currentAds = [...message];
        // Filter out the deleted item
        const updatedAds = currentAds.filter(ad => ad.id !== adNumber);
        // Update state
        setMessage(updatedAds);
        await axios.delete(`http://localhost:5000/api/delete/item/${adNumber}`, {
          headers: {
            Authorization: `Bearer ${token}`, 
          },
        });
        window.location.reload(); // ← Force page refresh
      } catch (error) {
        setErrorFrontend(error.response?.data?.error || "Dzēšanas kļūda ❌"); // Red error toast
      } finally {
        isSaving.current = false;
      }
    } else {
      return;
    }
  };

  //1. We get userData from backend.
  //2. We also save userData to Zustand Storage as cachedUserData. We will use this later at step 4.
  //3. When updating profile, we send userData from BtmProfile to BtmUpdateProfile component on the useNavigate hook.
  //Here actually, instead of sending data on useNavigate hook, we could use the same data on BtmUpdateProfile
  //component by making a call to the Zustand cachedUserData.  But i didnt do that because I want to know how to use
  //useNavigate data transfer technique. However, I will use it only here. In other components such as AD UPDATE component
  //I will use the data in the Zustand storage.

  //4. When we finish updating and return back to the BtmProfile, we check if there is a cachedUserData. If there is 
  //it is good, because now we do not have to make another request to backend to populate areas on the page.
  //5. When we want to update an ad, we first find the ad, save it to Zustand storage and then navigate to the 
  const updateAd = (n) => {
    const adNumber = Number(n);
    // Find the full record data from the message array
    const record = message.find(item => Number(item.id) === adNumber);
    if (record) {
      // Update Zustand store with the item data (new cachedItemData pattern)
      useUserStore.getState().setCachedItemData(record);
      // Navigate with state (unchanged from your original)
      navigate(`/profile/update-ad/${adNumber}`);
    }
  };

  const changePassword = () => {
    navigate("/profile/password-change"); 
  }

  return (
    <div>
      { loading ? 
        ( <div>lietotāja informācijas ielāde</div> )
          :
        ( 
        <div className='userInfoArea'>
          <div className='welcomeMessageProfile'>laipni lūdzam </div> 

          <div><strong>Vārds:</strong> {cachedUserData.name}</div>
          <div><strong>E-pasts:</strong> {cachedUserData.email}</div>
          <div><strong>Telefons:</strong> {cachedUserData.telephone}</div>
          <div className='lastDivProfile'><strong>Dalībnieks kopš:</strong> {cachedUserData.date}</div>
          <div className='profileButtonsArea'>
              <span><button className='button-54' onClick={signoutAccount}>Izrakstīties</button></span>
              <span><button className='button-54'
                onClick={() => navigate(`/profile/update-account/${visitorNumber}`, {state: { userData: cachedUserData } }
                )}>
                Atjaunināt kontu</button>
              </span>
              <span><button className='button-54' onClick={changePassword}>Mainīt paroli</button></span>
              <span><button className='button-54' onClick={deleteAccount}>Dzēst kontu</button></span>
          </div>
        </div>
        )
      }
      <div>
        { loading ? 
            <div aria-live="polite">Ielādē...</div> 
          : errorFrontend ? ( // Check for error first
            <p className='errorFieldProfile'>{errorFrontend}</p>
          ) :
            <>
              {message && message.length > 0  ? (
                <>
                  <div className='tableProfileArea'>
                    <table className='tableMainCategory'>
                      <thead> 
                        <tr>
                          <th className='columnProfile1' scope="col"></th>
                          <th className='columnProfile2' scope="col">Sludinājumi</th>
                          <th className='columnProfile3' scope="col">Informācija</th>
                          <th className='columnProfile4' scope="col">Cena</th>
                          <th className='columnProfile5' scope="col">Pilsēta</th>
                          <th className='columnProfile5' scope="col"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {message.map( record => (
                          <tr key={record.id} className='tableRowsProfile'>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='imgContainerCell'> 
                              <img className='adMainImage' src={record.image_url[0]} alt='a small pic of ad'/></td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cellProfile2'>
                              {record.title.length > 60 
                                ? `${record.title.substring(0, 60)}...` 
                                : record.title}
                            </td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cellProfile3'>
                              {record.description.length > 200 
                                ? `${record.description.substring(0, 200)}...` 
                                : record.description}
                            </td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cellProfile4'>{record.price}</td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cellProfile5'>{record.city}</td>
                            <td className='cellProfile6'>
                              <div className='profileListButtonsArea' 
                                onClick={() => updateAd(record.id)}>
                                <span>Atjaunināt</span>
                                <span className='profileListIcons'><img src='/svg_update2.svg' alt='Update icon'/></span>
                              </div>
                              <div className='profileListButtonsArea profileListButtonsAreaLower'
                                onClick={() => deleteAd(record.id)}>
                                <span>Dzēst</span>
                                <span className='profileListIcons'><img src='/svg_delete.svg' alt='Delete icon'/></span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="noAdsMessage">
                  <p>Jums vēl nav sludinājumu</p> {/* "You don't have any ads yet" in Latvian */}
                </div>
              )}
            </>
        }
      </div>
      <br/><br/><br/><br/><br/><br/>
      <br/><br/><br/><br/><br/><br/>
      <div className='FooterContainer'>
        <Footer />
      </div>
    </div>
  )
}

export default BtmProfile;