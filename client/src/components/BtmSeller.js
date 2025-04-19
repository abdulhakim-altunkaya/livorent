//Add a point system for each seller
//Make sure only logged in users can leave a like

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import "../styles/Profile.css";
import Footer from "./Footer.js";
import { useParams, useNavigate } from "react-router-dom";
import useUserStore from '../store/userStore';

function BtmSeller() {
  const navigate = useNavigate()
  //we will check zustand store to see if there is any user data in it. If there is
  //then no need to make repetitive requests to backend and database about user information
  const { cachedUserData } = useUserStore.getState(); 

  const debounceTimer = useRef(null);//we will use this to force wait time on like clicks

  const { sellerNumber } = useParams();
  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [userData, setUserData] = useState(null);
  const [errorFrontend, setErrorFrontend] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state
  const [resultArea, setResultArea] = useState("");
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get/adsbyuser/${sellerNumber}`);
        setMessage(response.data);     
        if (cachedUserData?.id === sellerNumber) {
          setUserData(cachedUserData);
          console.log("cached data displayed")
        } else {
          const responseUser = await axios.get(`http://localhost:5000/api/get/userdata/${sellerNumber}`);
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
  }, [sellerNumber, cachedUserData]);

  const handleLike = () => {
    console.log('Like before 10 seconds and before function run:', isLiked);
    setIsLiked(!isLiked);
    // Clear previous timeout if it exists
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    console.log('Like before 10 seconds and after function run:', isLiked);
    // Set a new debounce timer
    debounceTimer.current = setTimeout(() => {
      saveLike(!isLiked); // note: !isLiked because state hasn't updated yet
    }, 10000); // delay in milliseconds (10s here)

  }
  const saveLike = async (likeState) => {
    try {
      console.log('Like after 10 seconds:', likeState);
      /* const response = await axios.post('http://localhost:5000/api/like', {liked: likeState}); */
      // console.log('Like after 10 seconds:', response.data);
    } catch (error) {
      console.error('Error saving like:', error);
    }
  };

  return (
    <div>
      <div>
        { loading ? 
            <div aria-live="polite">Loading...</div> 
          : errorFrontend ? ( // Check for error first
            <p className='errorFieldProfile'>{errorFrontend}</p> 
          ) :
            <>
              {message && message.length > 0  ? (
                <>
                  <div className='userInfoArea'>
                    <div className='welcomeMessageProfile'>laipni lūdzam </div> 
                    <div><strong>Name:</strong> {userData.name}</div>
                    <div className='lastDivProfile'><strong>Member since:</strong> {userData.date}</div>
                    <div>
                      {
                        isLiked ?
                          <img className='heartIcon' onClick={handleLike} src='/svg_heart_filled.svg' alt='empty heart'/>
                        :
                          <img className='heartIcon' onClick={handleLike} src='/svg_heart.svg' alt='empty heart'/>
                      }
                      </div>
                  </div>

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

export default BtmSeller;