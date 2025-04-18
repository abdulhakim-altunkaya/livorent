import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/Profile.css";
import Footer from "./Footer.js";
import { useParams, useNavigate } from "react-router-dom";
import useUserStore from '../store/userStore';

function BtmProfile() {
  const navigate = useNavigate()
  //we will check zustand store to see if there is any user data in it. If there is
  //then no need to make repetitive requests to backend and database about user information
  const { cachedUserData } = useUserStore.getState();

  const { visitorNumber } = useParams();
  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [userData, setUserData] = useState(null);
  const [itemDataUpdate, setItemDataUpdate] = useState(null);
  const [errorFrontend, setErrorFrontend] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state
  const [resultArea, setResultArea] = useState("");

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get/adsbyuser/${visitorNumber}`);
        setMessage(response.data);     
        if (cachedUserData?.id === visitorNumber) {
          setUserData(cachedUserData);
          console.log("cached data displayed")
        } else {
          const responseUser = await axios.get(`http://localhost:5000/api/get/userdata/${visitorNumber}`);
          setUserData(responseUser.data);
          useUserStore.getState().setCachedUserData(responseUser.data);  // Zustand cache
        }

      } catch (error) {
        setErrorFrontend("Error: ads could not be fetched");
        console.log(error.message);
        setUserData({}); // Ensure userData is never null
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [visitorNumber, cachedUserData]);

  const deleteAccount = () => {
    alert("Accounts which are inactive for 6 months will be deleted together with their ads if any");
    return;
  }

  const signoutAccount = () => {
    localStorage.removeItem("token_livorent");
    localStorage.removeItem("visitorNumber");
    navigate("/");
  }



  const deleteAd = async (n) => {
    // This will show a browser confirmation dialog with OK/Cancel buttons
    const adNumber = Number(n)
    const userConfirmed = window.confirm(
      "Jūsu konts tiks dzēsts pēc 6 mēnešu neaktivitātes\n\nVai vēlaties turpināt?"
    );
    //userConfirmed means user confirmed delete operation.
    if (userConfirmed) {
      try {
        // Get current state before deletion
        const currentAds = [...message];
        // Filter out the deleted item
        const updatedAds = currentAds.filter(ad => ad.id !== adNumber);
        // Update state
        setMessage(updatedAds);
        await axios.delete(`http://localhost:5000/api/delete/item/${adNumber}`);
        window.location.reload(); // ← Force page refresh
      } catch (error) {
        setResultArea(error.response?.data?.error || "Dzēšanas kļūda"); // Red error toast
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

  return (
    <div>
      { loading ? 
        ( <div>lietotāja informācijas ielāde</div> )
          :
        ( 
        <div className='userInfoArea'>
          <div className='welcomeMessageProfile'>laipni lūdzam </div> 

          <div><strong>Name:</strong> {userData.name}</div>
          <div><strong>E-mail:</strong> {userData.email}</div>
          <div><strong>Telephone:</strong> {userData.telephone}</div>
          <div className='lastDivProfile'><strong>Member since:</strong> {userData.date}</div>

          <div className='profileButtonsArea'>
            <span><button className='button-54' onClick={signoutAccount}>Sign out</button></span>
            <span><button className='button-54'
              onClick={() => navigate(`/profile/update-account/${visitorNumber}`, {state: { userData: userData } }
              )}>
              Update Account</button>
            </span>
            <span><button className='button-54' onClick={deleteAccount}>Delete Account</button></span>
          </div>
        </div>
        )
      }
      <div>
        { loading ? 
            <div aria-live="polite">Loading...</div> 
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
                              {record.title.length > 100 
                                ? `${record.title.substring(0, 100)}...` 
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