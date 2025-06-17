import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Like.css";
import useUserStore from '../store/userStore';
import { getUserId } from './utilsAuth'; 

function BtmLikeSeller({ sellerId }) {
    //1.visitor id from utilsAuth
    const userIdData = getUserId(); // This returns an object { userNumber }
    const userId = userIdData.userNumber; // Get the actual number

    //2.visitor id from local storage
    //The same as userId. It comes from utilsAuth file. 
    const visitorNumberFromStorage = Number(localStorage.getItem("visitorNumber"));
    
    //3.visitor id from zustand store
    //topnavbar sends data to setUserData function of utilsAuth file. UtilsAuth file sends data to zustand file useStore.js
    const { cachedUserData } = useUserStore.getState();
    const visitorNumberCached = cachedUserData.id;

    const token = localStorage.getItem("token_livorent");
    const navigate = useNavigate();

    const [hasLiked, setHasLiked] = useState(false);
    const [isLikeAllowed, setIsLikeAllowed] = useState(true);
    const [likeCount, setLikeCount] = useState(0);
    const [likeNum, setLikeNum] = useState(null);
    const [likeState, setLikeState] = useState(false);
    const [likeMessage, setLikeMessage] = useState("");

    const handleLike = async () => {
      if (visitorNumberFromStorage < 1) {
        setIsLikeAllowed(false);
        return;
      }
      //only people who are registered can like or unlike
      const newHasLiked = !hasLiked;
      setHasLiked(newHasLiked);
      if (newHasLiked) {
        setLikeCount((prev) => prev + 1); // you're liking now
      } else {
        setLikeCount((prev) => Math.max(0, prev - 1)); // you're unliking
      }
      
    }

    const saveLike = async () => {
      try {
        const likeObject = { 
            likerId: visitorNumberFromStorage,
            likedSeller: sellerId,
            likeStatus: hasLiked, 
        };
        const res1 = await axios.post("http://localhost:5000/api/post/save-like-seller", likeObject, {
            headers: {Authorization: `Bearer ${token}`}
        });
      } catch (error) {
        console.log(error.message);
      }
    }

    return (
        <div>
            {hasLiked ?
              <div className='likeArea'>
                  <img className='heartIcon' onClick={handleLike} src='/svg_heart_filled.svg' alt='full heart'/> 
                  <span>{likeCount} full heart true hasLiked</span>              
              </div>
              :
              <div className='likeArea'>
                  <img className='heartIcon' onClick={handleLike} src='/svg_heart.svg' alt='empty heart'/> 
                  <span>{likeCount}empty heart false hasLiked</span>              
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
    )
}

export default BtmLikeSeller;

/*
    const getData = async () => {
      try {
        //we will check the total number of likes for that seller or item. 
        //Also we will check if user is inside like likers array. That is why we are sending it also. 
        const response = await axios.get(`http://localhost:5000/api/get/likes/seller/${sellerOrItemId}`, {
          params: { visitor: visitorId }
        });
        setLikeNum(Number(response.data.resLikeCount));
        setLikeState(response.data.resLikeStatus);
        setLikeMessage(response.data.resMessage);
      } catch (error) {
        console.log(error.message);
      }
    }

    useEffect(() => {
        getData();
    }, [sellerOrItemId])

  const debounceTimer = useRef(null);//we will use this to force wait time on like clicks
  const [resultArea, setResultArea] = useState("");
  const [isLikeAllowed, setIsLikeAllowed] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState("");

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
        if (error.response && error.response.data) {
          console.log("Raw error.response.data:", error.response.data);

          // Defensive check in case data is not an object
          const data = typeof error.response.data === "object" ? error.response.data : {};

          const code = data.responseErrorCode;
          const message = data.responseMessage || "Unknown backend error";

          if (code === 1) {
            console.error("Error: Seller ID missing in endpoint route");
          } else if (code === 2) {
            console.error("Error: Seller ID is invalid");
          } else if (code === 3) {
            console.error("Error: No likes found for this seller");
          } else if (code === 4) {
            console.error("Error: Conflict detected between seller_id and voted_clients");
          } else if (code === 5) {
            console.error("Error: Database or server issue");
          } else {
            console.error(`Error code ${code}: ${message}`);
          }
        } else {
          // No response received or network error
          console.error("Network or unknown error:", error.message);
        }
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
    } catch (error) {
      console.error('Error saving like:', error);
    }
  };
  
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
                  
*/