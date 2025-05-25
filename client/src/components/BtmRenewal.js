import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";
import Footer from "./Footer";
import useUserStore from '../store/userStore'; // Adjust path accordingly

function BtmRenewal() { 
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [secretWord, setSecretWord] = useState("");
  const [passtext, setPasstext] = useState("");
  const [passtextControl, setPasstextControl] = useState("");
  const [resultArea, setResultArea] = useState("");


  useEffect(() => {
    localStorage.removeItem("token_livorent");
    localStorage.removeItem("visitorNumber");
    useUserStore.getState().clearCachedUserData?.();
    setResultArea(""); // UI state
  }, []);

 
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (passtext !== passtextControl) {
      setResultArea("Passwords do not match.");
      return;
    }

    if (!email || !secretWord) {
      setResultArea("Please enter both email and secret word.");
      return;
    }

    try { 
      const renewalObject = {
        renewalEmail: email, 
        renewalPasstext: passtext,
        renewalSecretWord: secretWord
      };
      const res1 = await axios.post("http://localhost:5000/api/post/password-renewal", renewalObject);
      // Servers sends ok message and token upon successful secret word check and password change
      // New token is different from old ones with its version number. This will cause all other logins to close.
      // And we save this token and profile number in the localstorage
      const { responseToken, responseNumber, responseStatus, responseUser, responseMessage } = res1.data;
      if (responseStatus === true) {
        localStorage.setItem("token_livorent", responseToken);// save the token 
        localStorage.setItem("visitorNumber", Number(responseNumber));// save the user id
        useUserStore.getState().setCachedUserData(responseUser);// set also the cache
        setResultArea(responseMessage);

        // Small delay before navigation to allow store update
        // Later when people visit profile component, it will get data from zustand cache.
        setTimeout(() => {
          // navigate(`/profile/${responseNumber}`); navigate does not refresh page
          // we need to refresh page to reflect state update on profile*/
          window.location.href = `/profile/${responseNumber}`;
        }, 200); // 0.2 seconds might help
        
      }
    } catch (error) {
        if (error.response) {
          // Use structured backend message if available
          const serverMessage = error.response.data?.responseMessage || "Unexpected server error.";
          setResultArea(serverMessage);
          console.error("Server responded with error:", error.response.data);
        } else {
          // Network error, timeout, or no response
          setResultArea("Network or server connection error.");
          console.error("Request failed:", error.message);
        }
    }
  }

  return (
    <div>
        <div className="tabContainer">
          <span className="activeTab">Ieeja</span>
        </div>
        <div className="loginFormArea">
          <form className="loginForm" onSubmit={handleSubmit}>
            <div className="loginInputs">
              <label htmlFor="inputEmail">E-pasts:</label>
              <input className="loginInputShort" type="text" id="inputEmail" 
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="loginInputs">
              <label htmlFor="inputSecretWord">Kā sauc jūsu labāko draugu bērnībā?</label>
              <input className="loginInputShort" type="text" id="inputSecretWord"
                value={secretWord} onChange={(e) => setSecretWord(e.target.value)} required />
            </div>
            <div className="loginInputs">
              <label htmlFor="inputPasstext">Jauna parole:</label>
              <input className="loginInputShort" type="text" id="inputPasstext"
                value={passtext} onChange={(e) => setPasstext(e.target.value)} required  />
            </div>
            <div className="loginInputs">
              <label htmlFor="inputPasstextControl">Atkārtot jauno paroli:</label>
              <input className="loginInputShort" type="text" id="inputPasstextControl"
                value={passtextControl} onChange={(e) => setPasstextControl(e.target.value)} required  />
            </div>
            <button className="btnSelectCategory2" type="submit">saglabāt</button>
          </form>
          <div>{resultArea}</div>
        </div>
        <br /><br /><br /><br /><br /><br /><br /><br />
        <Footer />
      </div>
  )
}

export default BtmRenewal