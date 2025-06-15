//Add a point system for each seller
//Make sure only logged in users can leave a like
//improve isLikeAllowed logic

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import "../styles/Profile.css";
import Footer from "./Footer.js";
import ReviewDisplay from "./ReviewDisplay.js";
import { useParams, useNavigate } from "react-router-dom";
import useUserStore from '../store/userStore';

function BtmSeller() {
  const navigate = useNavigate()
  //we will check zustand store to see if there is any user data in it. If there is
  //then no need to make repetitive requests to backend and database about user information
  const { cachedSellerData } = useUserStore.getState(); 

  //we will check zustand store to see if there is any user data in it. If there is
  //then no need to make repetitive requests to backend.
  //We will use cachedUserData to let the visitor to leave a like. Only registered people can like.
  const { cachedUserData } = useUserStore.getState();

  const debounceTimer = useRef(null);//we will use this to force wait time on like clicks

  const { sellerNumber } = useParams();
  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [sellerData, setSellerData] = useState(null);
  const [errorFrontend, setErrorFrontend] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state
  const [resultArea, setResultArea] = useState("");
  const [isLikeAllowed, setIsLikeAllowed] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState("");
  const token = localStorage.getItem("token_livorent");
  const [rating, setRating] = useState("4.7");

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get/adsbyuser/${sellerNumber}`);
        setMessage(response.data);     
        //sometimes the visitor might want to visit the same seller over and over again. 
        //To help backend receive less api calls, we can save the visited seller info in Zustand
        //Thus, if the visitor visits the same seller again, the seller info will come from Zustand not from DB.
        if (cachedSellerData?.id === sellerNumber) {
          setSellerData(cachedSellerData);
          console.log("cached data displayed");
        } else {
          const responseUser = await axios.get(`http://localhost:5000/api/get/userdata/${sellerNumber}`);
          setSellerData(responseUser.data);
          useUserStore.getState().setCachedSellerData(responseUser.data);
        } 
      } catch (error) {
        setErrorFrontend("Error: ads could not be fetched");
        console.log(error.message);
        setSellerData({}); // Ensure sellerData is never null
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [sellerNumber]);

  useEffect(() => {
    const getData2 = async () => {
      //we will get the total number of likes and if user has liked before or not. If liked, heart will be filled.
      //we will send seller id in req.params and visitor id in req.query
      //we cannot use req.body because req.body can only be used with axios.post requests
      //backend will check if the visitor has liked the seller.
      //If visitor has liked, it will return a TRUE and like count value.
      if (!cachedUserData || !cachedUserData.id) {
        setIsLiked(false); // not logged in
      }
      const visitorId = cachedUserData?.id || 0; //we are sending at least a 0 to prevent crashes if no login

      try {
        const response = await axios.get(`http://localhost:5000/api/like/get-seller-likes-count/${sellerNumber}`, {
          params: { visitor: visitorId }
        });
        
        const likeNum = Number(response.data.responseLikeCount);
        const likeSta = response.data.responseLikeStatus;

        if (likeNum > 0) {
          setLikeCount(likeNum); 
        }
        if (likeSta === true) {
          setIsLiked(true)
        } else {
          setIsLiked(false);
        }

      } catch (error) {
        console.log(error.message);
      }
    }
    getData2();
  }, [sellerNumber]);
  

  const handleLike = () => {
    // Check if visitor is logged in
    if (!cachedUserData || !cachedUserData.id) {
      alert("To leave a like, you need to login");
      setIsLikeAllowed(!isLikeAllowed)
      return;
    }
    const newLikeState = !isLiked; // this is the actual updated state
    if (newLikeState === true) {
      setLikeCount(likeCount+1);
    } else if (newLikeState === false) {
      setLikeCount(likeCount-1);
    }
    setIsLiked(newLikeState);
    // Clear previous timeout if it exists
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    // Set a new debounce timer
    debounceTimer.current = setTimeout(() => {
      saveLike(newLikeState);
    }, 5000); // delay in milliseconds (5s here)
  };
  const saveLike = async (likeState) => {

    try {
      console.log('Like after 10 seconds:', likeState);
      if (cachedSellerData?.id === cachedUserData?.id) {
        console.log("No self like");
        return; 
      }
      const response = await axios.post('http://localhost:5000/api/like/sellers', 
        {likeStatus: likeState,
        likedId: cachedSellerData?.id,//in BtmItem component this will be cachedItemData.id
        userId: cachedUserData?.id
        },
        {headers: {
          Authorization: `Bearer ${token}`
        }}
      );
      await new Promise(resolve => setTimeout(resolve, 1100));
      const response2 = await axios.post('http://localhost:5000/api/like/seller-to-users', 
      {likeStatus: likeState,
      likedId: sellerData?.id,
      userId: cachedUserData?.id
      },
      {headers: {
        Authorization: `Bearer ${token}`
      }}
      );
      console.log('LIKE LOGIC 1:', response.data.myMessage);
      console.log('LIKE LOGIC 2:', response2.data.myMessage);
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
                <div className='userInfoArea'>
                  <div>Name: <strong>{sellerData.name}</strong> </div>
                  <div>Rating: <strong>{rating}</strong> </div>
                  <div className='lastDivProfile'>Since: <strong>{sellerData.date}</strong></div>
                  <div>
                    {
                      isLiked ?
                        <div className='likeArea'>
                          <img className='heartIcon' onClick={handleLike} src='/svg_heart_filled.svg' alt='full heart'/> 
                          <span>{likeCount}</span>              
                        </div>
                      :
                        <div className='likeArea'>
                          <img className='heartIcon' onClick={handleLike} src='/svg_heart.svg' alt='empty heart'/> 
                          <span>{likeCount}</span>              
                        </div>
                    }
                    {
                      isLikeAllowed ?
                        <></>
                      :
                      <div className="noUserBtmUpload">
                        Lai atzīmētu ar "patīk", jābūt reģistrētam.
                        <span onClick={() => navigate("/login")}> Ieiet</span> vai 
                        <span onClick={() => navigate("/registration")}> reģistrēties</span>.
                      </div>
                    }
                  </div>
                </div>

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
      <div> <ReviewDisplay reviewReceiver={sellerNumber} /></div>
      <br/><br/><br/><br/><br/><br/>
      <div className='FooterContainer'>
        <Footer />
      </div>
    </div>
  )
}

export default BtmSeller;