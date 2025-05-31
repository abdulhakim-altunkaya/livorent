import React, {useState, useEffect} from "react";
import axios from "axios";
import "../styles/Login.css";
import Footer from "./Footer";
import useUserStore from '../store/userStore'; // Adjust path accordingly

function BtmRenewal() { 

  const [email, setEmail] = useState("");
  const [secretWord, setSecretWord] = useState("");
  const [passtext, setPasstext] = useState("");
  const [passtextControl, setPasstextControl] = useState("");
  const [resultArea, setResultArea] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.removeItem("token_livorent");
    localStorage.removeItem("visitorNumber");
    useUserStore.getState().clearCachedUserData?.();
    setResultArea(""); 
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
    setLoading(true);
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

        setLoading(false);
        // Small delay before navigation to allow store update
        // Later when people visit profile component, it will get data from zustand cache.
        setEmail("");
        setSecretWord("");
        setPasstext("");
        setPasstextControl("");
        setTimeout(() => {
          // navigate(`/profile/${responseNumber}`); navigate does not refresh page
          // we need to refresh page to reflect state update on profile*/
          window.location.href = `/profile/${responseNumber}`;
        }, 1300); // 1.3 seconds will help to update the state and to let the user read resultArea
        
      }
    } catch (error) {
        if (error.response) {
          // Use structured backend message if available
          const serverMessage = error.response.data?.responseMessage || "Unexpected server error.";
          setResultArea(serverMessage);
          console.error("Server responded with error:", error.response.data);
          setLoading(false);
        } else {
          // Network error, timeout, or no response
          setResultArea("Network or server connection error.");
          console.error("Request failed:", error.message);
          setLoading(false);
        }
    }
  }

  return (
    <div>
        <span className="titlePasswordReset">Paroles atjaunošana</span>
        <div className="loginFormArea">
          <form className="loginForm" onSubmit={handleSubmit}>
            <div className="loginInputs">
              <label htmlFor="inputEmail">E-pasts:</label>
              <input className="loginInputShort" type="text" id="inputEmail" 
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="loginInputs">
              <label htmlFor="inputSecretWord">Kā sauc jūsu labāko draugu bērnībā?</label>
              <input className="loginInputShort" type="text" id="inputSecretWord" autoComplete="off"
                value={secretWord} onChange={(e) => setSecretWord(e.target.value)} required />
            </div>
            <div className="loginInputs">
              <label htmlFor="inputPasstext">Jauna parole:</label>
              <input className="loginInputShort" type="password" id="inputPasstext" autoComplete="off"
                value={passtext} onChange={(e) => setPasstext(e.target.value)} required  />
            </div>
            <div className="loginInputs">
              <label htmlFor="inputPasstextControl">Atkārtot jauno paroli:</label>
              <input className="loginInputShort" type="password" id="inputPasstextControl" autoComplete="off"
                value={passtextControl} onChange={(e) => setPasstextControl(e.target.value)} required  />
            </div>
            <button className="btnSelectCategory2" type="submit" disabled={loading}>
              {loading ? "Apstrādā..." : "Saglabāt"}
            </button>
          </form>
          <div>{resultArea}</div>
        </div>
        <br /><br /><br /><br /><br /><br /><br /><br />
        <Footer />
      </div>
  )
}

export default BtmRenewal