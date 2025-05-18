import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";
import Footer from "./Footer";
import useUserStore from '../store/userStore'; // Adjust path accordingly

function BtmLogin() { 
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [passtext, setPasstext] = useState("");
  const [resultArea, setResultArea] = useState("");
  const token = localStorage.getItem("token_livorent");
  
  useEffect(() => {
    
    const visitorNumberRaw = localStorage.getItem("visitorNumber");
    const visitorNumber = Number(visitorNumberRaw);
    const cachedUser = useUserStore.getState().cachedUserData;

    // ✅ Before login: Clean up inconsistent or broken state
    /*Before login, make sure invalid or outdated data doesn’t cause issues */
    if (token && (!visitorNumberRaw || isNaN(visitorNumber))) {
      console.warn("Cleaning up invalid visitorNumber/token pair...");
      localStorage.removeItem("token_livorent");
      localStorage.removeItem("visitorNumber");
      return;
    }

    // ✅ Already logged in: Redirect to profile
    /*If someone is already logged in (i.e., token and user data exist), 
    redirect them to their profile instead of showing the login form. */
    if (token && visitorNumber && cachedUser?.id === visitorNumber) {
      console.log("User already logged in – redirecting to profile");
      window.location.href = `/profile/${visitorNumber}`;
    }
  }, []);

 
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !passtext) {
      setResultArea("Please enter both email and password.");
      return;
    }

    try { 
      const loginObject = {
        loginEmail: email, 
        loginPasstext: passtext
      };
      const res1 = await axios.post("http://localhost:5000/api/login", loginObject, {
        headers: {
          Authorization: `Bearer ${token}` // Optional for login
        }
      });

      // Servers sends ok message and token upon successful login,
      // and we save token in localStorage
      if (res1.data.token) {
        localStorage.setItem("token_livorent", res1.data.token); // Save the token 
        localStorage.setItem("visitorNumber", Number(res1.data.visitorNumber)); //save the user id
        // set also the cache
        useUserStore.getState().setCachedUserData(res1.data.myMessage);
        setResultArea(res1.data.myMessage);
        // Small delay before navigation to allow store update
        // Later when people visit profile component, it will get data from zustand cache.
        setTimeout(() => {
          // navigate(`/profile/${res1.data.visitorNumber}`); navigate does not refresh page
          // we need to refresh page to reflect state update on profile*/
          window.location.href = `/profile/${res1.data.visitorNumber}`;
        }, 50); // Even 10–50ms can help
        
      }

    } catch (error) {
      if (error.response) {
        setResultArea(error.response.data.myMessage);
        console.log(error.message);
      } else {
        setResultArea("Error happened login, no data from backend");
        console.log(error.message);
      }
    }
  }

  return (
    <div>
        <div className="tabContainer">
          <span className="activeTab" onClick={() => navigate("/login") }>Ieeja</span>
          <span className="inactiveTab" onClick={() => navigate("/registration") }>Reģistrācija</span>
        </div>
        <div className="loginFormArea">
          <form className="loginForm" onSubmit={handleSubmit}>

              <div className="loginInputs">
                <label htmlFor="inputEmail">E-pasts:</label>
                <input className="loginInputShort" type="text" id="inputEmail" 
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="loginInputs">
                <label htmlFor="inputPasstext">Parole:</label>
                <input className="loginInputShort" type="text" id="inputPasstext"
                  value={passtext} onChange={(e) => setPasstext(e.target.value)} required  />
              </div>
              
            <button className="btnSelectCategory2" type="submit">Ieiet</button>
          </form>
          <div>{resultArea}</div>
        </div>
        <br /><br /><br /><br /><br /><br /><br /><br />
        <Footer />
      </div>
  )
}

export default BtmLogin