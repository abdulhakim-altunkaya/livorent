import {useEffect, useState} from 'react';
import axios from "axios";
import "../styles/Like.css";
import useUserStore from '../store/userStore';

function BtmLike({ sellerOrItemId }) {
    //we will check zustand store to see if there is any user data in it. If there is
    //then no need to make repetitive requests to backend.
    //We will use cachedUserData to let the visitor to leave a like. Only registered people can like.
    const { cachedUserData } = useUserStore.getState();

    const [isLikeAllowed, setIsLikeAllowed] = useState(true);

    const getData = async () => {
      try {
        const response = await axios
      } catch (error) {
        console.log(error.message);
      }
    }

    useEffect(() => {
        getData();
    }, [sellerOrItemId])
    
    const handleLike = () => {
      
    }

    const saveLike = async () => {
      
    }

    return (
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
    )
}

export default BtmLike