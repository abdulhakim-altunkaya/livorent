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

export const getUserDetails = async () => {
  return 11111;
}