import React, {useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";
import Footer from "./Footer";
import useUserStore from '../store/userStore'; // Adjust path accordingly

function BtmRegister() {
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [passtext, setPasstext] = useState("");
  const [resultArea, setResultArea] = useState("");
  const [passtextControl, setPasstextControl] = useState("");
  const [secretWord, setSecretWord] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token_livorent");
    const visitorNumberRaw = localStorage.getItem("visitorNumber");
    const visitorNumber = Number(visitorNumberRaw);
    const cachedUser = useUserStore.getState().cachedUserData;

    // ✅ Before registration: Clean up inconsistent or broken state
    /*Before registration, make sure invalid or outdated data doesn’t cause issues */
    if (token && (!visitorNumberRaw || isNaN(visitorNumber))) {
      console.warn("Cleaning up invalid visitorNumber/token pair...");
      localStorage.removeItem("token_livorent");
      localStorage.removeItem("visitorNumber");
      return;
    }

    // ✅ Already registered and logged in: Redirect to profile
    /*If someone is already logged in (i.e., token and user data exist), 
    redirect them to their profile instead of showing the registation for form. */
    if (token && visitorNumber && cachedUser?.id === visitorNumber) {
      console.log("User already logged in – redirecting to profile");
      window.location.href = `/profile/${visitorNumber}`;
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
      
    // Check if passwords match
    if (passtext !== passtextControl) {
      alert("passwords do not match") 
      return; // Stop form submission
    }

    setLoading(true);
    setResultArea("");
    
    try {
      const registerObject = {
        registerName: name, 
        registerTelephone: telephone, 
        registerEmail: email, 
        registerPasstext: passtext,
        registerSecretWord: secretWord
      };

      const res1 = await axios.post("http://localhost:5000/api/register", registerObject);
      setResultArea(res1.data.resMessage);
      
      // Servers sends ok message and token upon successful login,
      // and we save token in localStorage
      if (res1.data.resToken) {
        localStorage.setItem("token_livorent", res1.data.resToken);
        localStorage.setItem("visitorNumber", Number(res1.data.resVisitorNumber));
        // set also the cache
        useUserStore.getState().setCachedUserData(res1.data.resUser);
        // Small delay before navigation to allow store update
        // Later when people visit profile component, it will get data from zustand cache.
        setTimeout(() => {
          // navigate(`/profile/${res1.data.visitorNumber}`); navigate does not refresh page
          // we need to refresh page to reflect state update on profile*/
          window.location.href = `/profile/${res1.data.resVisitorNumber}`;
        }, 1800); //1.8 seconds to let user read the result area message
      }

    } catch (error) {
      if (error.response) {
        setResultArea(error.response.data.resMessage);
        console.log(error.message);
        setLoading(false);
      } else {
        setResultArea("Error happened while signup, no data from backend");
        console.log(error.message);
        setLoading(false);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
        <div className="tabContainer"> 
          <span className="inactiveTab" onClick={() => navigate("/login") }>Ieeja</span>
          <span className="activeTab" onClick={() => navigate("/registration") }>Reģistrācija</span>
        </div>
      <div className="loginFormArea">
        <form className="loginForm" onSubmit={handleSubmit}>
            <div className="loginInputs">
              <label htmlFor="inputName">Vārds:</label>
              <input className="loginInputShort" type="text" id="inputName"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="loginInputs">
              <label htmlFor="inputTelephone">Tālrunis:</label>  
              <input className="loginInputShort" type="number" id="inputTelephone" 
                value={telephone} onChange={(e) => setTelephone(e.target.value)} required />
            </div>
            <div className="loginInputs">
              <label htmlFor="inputEmail">E-pasts:</label>
              <input className="loginInputShort" type="text" id="inputEmail" 
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="loginInputs">
              <label htmlFor="inputPasstext">Parole:</label>
              <input className="loginInputShort" type="password" id="inputPasstext"
                value={passtext} onChange={(e) => setPasstext(e.target.value)} required  />
            </div>
            <div className="loginInputs">
              <label htmlFor="inputPasstextControl">Atkārtot paroli:</label>
              <input className="loginInputShort" type="password" id="inputPasstextControl"
                value={passtextControl} onChange={(e) => setPasstextControl(e.target.value)} required  />
            </div>
            <div className="loginInputs">
              <label htmlFor="inputSecretWord">Kā sauc jūsu labāko draugu bērnībā?</label>
              <input className="loginInputShort" type="text" id="inputSecretWord"
                value={secretWord} onChange={(e) => setSecretWord(e.target.value)} required />
              <small><em>Šo atbildi izmantosim, lai pārbaudītu jūsu identitāti, ja aizmirstat paroli.</em></small>
            </div>
          <button className="btnSelectCategory2" type="submit" disabled={loading} >
            {loading ? "Lūdzu uzgaidiet..." : "Reģistrēties"}
          </button>
        </form>
        <div>{resultArea}</div>
      </div>
      <br /><br /><br /><br /><br /><br /><br /><br />
      <Footer />
    </div>
  )
}

export default BtmRegister