import axios from 'axios';
import useUserStore from '../store/userStore'; // Adjust path accordingly
import { jwtDecode } from 'jwt-decode'; // ✅ correct

export const getUserId = () => {
    // 1. Get user id from local storage. if user id("visitorNumber") exists, it is good
    // Then we can make a call to the backend and fetch user details. I separated functions
    // to make it easier to read. 
    const token = localStorage.getItem('token_livorent');
    const visitorNumber = localStorage.getItem('visitorNumber');
  
    // 2. Check if they exist. User id without token can be a spam. So we will ignore those.
    if (!token || !visitorNumber) { 
      return { 
        userNumber : 0
      }; 
    }
     
    // 3. Return ONLY what you know exists
    return {
      userNumber: Number(visitorNumber) // Convert to number if needed
    };
  };

  
  export const setUserData = async () => {
    const token = localStorage.getItem('token_livorent');
    const cachedUser = useUserStore.getState().cachedUserData;
    const storedVisitorNumber = Number(localStorage.getItem('visitorNumber'));
  
    // ✅ Check if there is token
    if (!token) {
      return {
          userNumber: 0,
          userData: null,
      };
    }

    // ✅ Check if token is expired using JWT decode
    try {
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        console.warn("JWT token has expired");
        return {
          userNumber: 0,
          userData: null,
        };
      }
    } catch (err) {
      console.error("Invalid JWT token:", err);
      return {
        userNumber: 0,
        userData: null,
      };
    }

    // ✅ If cache is already correct, skip API call
    if (cachedUser && Number(cachedUser.id) === storedVisitorNumber) {
      console.log("Cache is valid — skipping verify-token call");
      return {
        userNumber: storedVisitorNumber,
        userData: cachedUser,
      };
    }
   
    // ✅ In other cases, verify the token in the backend and also set the zustand cache user data to api call userData.
    try {
      const response = await axios.get('http://localhost:5000/api/verify-token', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.data && response.data.userId) {
        useUserStore.getState().setCachedUserData(response.data.userData);
        return {
          userNumber: response.data.userId, 
          userData: response.data.userData,
        };
      } else {
        return {
          userNumber: 0,
          userData: null,
        };
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      return {
        userNumber: 0,
        userData: null,
      };
    }
  };
  
  