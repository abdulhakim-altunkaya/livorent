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
  const [loading, setLoading] = useState(false);
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
    setResultArea(""); // Clear previous result before submitting
    setLoading(true);

    try { 
      const loginObject = {
        loginEmail: email.toLowerCase().trim(), 
        loginPasstext: passtext.trim()
      };
      const res1 = await axios.post("http://localhost:5000/api/login", loginObject);
      if (!res1.data?.resToken || !res1.data?.resVisitorNumber || !res1.data?.resUser) {
        setResultArea("Response from Backend is missing required data.");
        return;
      }
      
      localStorage.setItem("token_livorent", res1.data.resToken);
      localStorage.setItem("visitorNumber", Number(res1.data.resVisitorNumber));
      // set also the cache
      useUserStore.getState().setCachedUserData(res1.data.resUser);
      setResultArea(res1.data.resMessage);
      // Small delay before navigation to allow store update
      // Later when people visit profile component, it will get data from zustand cache.
      setTimeout(() => {
        // navigate(`/profile/${res1.data.visitorNumber}`); navigate does not refresh page
        // we need to refresh page to reflect state update on profile*/
        window.location.href = `/profile/${res1.data.resVisitorNumber}`;
      }, 1800); // 1.8 seconds might help
      

    } catch (error) {
        if (error.response && error.response.data) {
          const { resErrorCode, resMessage } = error.response.data;

          if (resErrorCode === 1) {
            setResultArea("Lietotājs ar šo e-pastu nav atrasts.");
          } else if (resErrorCode === 2) {
            setResultArea("Nepareizs e-pasts vai parole.");
          } else if (resErrorCode === 3) {
            setResultArea("Neizdevās pieslēgties datubāzei. Lūdzu, mēģiniet vēlāk.");
          } else if (resErrorCode === 4) {
            setResultArea("Lūdzu, aizpildiet visus laukus.");
          } else {
            setResultArea(resMessage || "Nezināma kļūda. Mēģiniet vēlreiz.");
          }

          console.warn(`Login error: code ${resErrorCode} – ${resMessage}`);
        } else {
          setResultArea("Neizdevās izveidot savienojumu ar serveri.");
          console.error("Unhandled login error:", error.message);
        }
    } finally {
      setLoading(false);
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
                <input className="loginInputShort" type="text" id="inputPasstext" autoComplete="off"
                  value={passtext} onChange={(e) => setPasstext(e.target.value)} required  />
              </div>
              
            <button className="btnSelectCategory2" disabled={loading}>
              {loading ? "Pārbauda..." : "Ieiet"}
            </button>
          </form>
          <div>{resultArea}</div>
        </div>
        <br /><br /><br /><br /><br /><br /><br /><br />
        <Footer />
      </div>
  )
}

export default BtmLogin