import { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Like.css";
import useUserStore from '../store/userStore';
import { getUserId } from './utilsAuth'; 

function BtmLikeItem({ itemId }) {
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
    const [likeMessage, setLikeMessage] = useState("");

    const timeoutRef = useRef(null); // to store debounce timer
    const latestLikeStatus = useRef(hasLiked); // to store the latest like state

    //these state variables will be updated with get-like api endpoint. We will then use the updated
    //variables to send data to post-like api endpoint. 
    const [databaseLike, setDatabaseLike] = useState(false);
    const [databaseCount, setDatabaseCount] = useState(0);
    const [databaseIsFirstLike, setIsFirstLike] = useState(false);

    const getLikeData = async () => {
      try {
        const res2 = await axios.get(`http://localhost:5000/api/get/like-item/${itemId}`, {
          params: { visitorId: visitorNumberFromStorage }
        }); 
        if (res2.data.resOkCode === 1) {
          // No one has liked this item yet
          setDatabaseLike(res2.data.resVisitorIncluded);//this will be false, empty heart
          setDatabaseCount(0);
          setHasLiked(false);
          setIsFirstLike(true);
        } else if (res2.data.resOkCode === 2) {
          // Visitor has liked before, full heart
          setDatabaseLike(res2.data.resVisitorIncluded);//this will be true, full heart
          setDatabaseCount(res2.data.resLikeCount);
          setHasLiked(true);
          setIsFirstLike(false);
        } else if (res2.data.resOkCode === 3) {
          // Visitor has not liked yet, item has some likes
          setDatabaseLike(res2.data.resVisitorIncluded);//this will be false, empty heart
          setHasLiked(false);
          setDatabaseCount(res2.data.resLikeCount);
          setIsFirstLike(false);
        } else {
          // Unexpected but successful response
          console.warn("Unhandled response code", res2.data);
        }
      } catch (error) {
        
      }
    }

    useEffect(() => {
      getLikeData();
    }, [itemId]);

    const handleLike = async () => {
      if (visitorNumberFromStorage < 1) {
        setIsLikeAllowed(false);
        return;
      }
      //only people who are registered can like or unlike
      const newHasLiked = !hasLiked;
      setHasLiked(newHasLiked);
      latestLikeStatus.current = newHasLiked; // ✅ Update latest value

      if (newHasLiked) {//we cannot check hasLiked state update takes a little time
        setDatabaseCount((prev) => prev + 1); // you're liking now
      } else {
        setDatabaseCount((prev) => Math.max(0, prev - 1)); // you're unliking
      }

      // We will let the user to click heart icon many times before triggering
      //saveLike function with the last like value
      clearTimeout(timeoutRef.current); // cancel the earlier scheduled saveLike
      // Set new timeout to call saveLike after 10 seconds
      timeoutRef.current = setTimeout(() => {
        saveLike(latestLikeStatus.current);
      }, 5000);
    }

    const saveLike = async (likeSta) => {
      try {
        const likeObject = { 
            likerId: visitorNumberFromStorage,
            likedItem: Number(itemId),
            likeOldStatus: databaseLike,
            likeNewStatus: likeSta, 
            likeIsFirst: databaseIsFirstLike,
            likersArrayLength: Number(databaseCount)
        };
        const res1 = await axios.post("http://localhost:5000/api/post/save-like-item", likeObject, {
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
                  <span>{databaseCount}</span>              
              </div>
              :
              <div className='likeArea'>
                  <img className='heartIcon' onClick={handleLike} src='/svg_heart.svg' alt='empty heart'/> 
                  <span>{databaseCount}</span>              
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

export default BtmLikeItem;

