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

  import axios from 'axios';
  import useUserStore from '../store/userStore'; // Adjust path accordingly
  
  export const setUserData = async () => {
    // 1. Get token and visitorNumber from local storage
    const token = localStorage.getItem('token_livorent');
    const visitorNumber = localStorage.getItem('visitorNumber');
    
    // 2. If token or visitorNumber doesn't exist, we cannot proceed
    if (!token || !visitorNumber) {
      return { userNumber: 0 };
    }
  
    // 3. If the user is logged in, send token to backend to verify and get user data
    try {
      const response = await axios.get('http://localhost:5000/api/verify-token', {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token to backend for verification
        }
      });
  
      // If the token is valid and user data is retrieved
      if (response.data && response.data.userId === Number(visitorNumber)) {
        // 4. Set cachedUserData in Zustand store or other state management solution
        useUserStore.getState().setCachedUserData(response.data.userData);
  
        return {
          userNumber: Number(visitorNumber), // User is valid
          userData: response.data.userData, // Returning user data for further use if necessary
        };
      } else {
        // If the token verification fails or user mismatch
        return { userNumber: 0 };
      }
    } catch (error) {
      console.error("Error verifying token:", error);
      return { userNumber: 0 };
    }
  };
  
  