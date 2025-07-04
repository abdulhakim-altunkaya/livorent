import {useState, useEffect, useRef} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";
import Footer from "./Footer";
import useUserStore from '../store/userStore'; // Adjust path accordingly

function BtmRegister() {
  const navigate = useNavigate();
  const isSaving = useRef(false);  // flag to prevent repetitive requests and duplicates

  const [name, setName] = useState("");
  const [telephone, setTelephone] = useState(null);
  const [email, setEmail] = useState("");
  const [passtext, setPasstext] = useState("");
  const [resultArea, setResultArea] = useState("");
  const [passtextControl, setPasstextControl] = useState("");
  const [secretWord, setSecretWord] = useState("");
  const [savingButton, setSavingButton] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword3, setShowPassword3] = useState(false);

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
    if (!name || !telephone || !email) {
      setResultArea("Lūdzu, aizpildiet visus obligātos laukus. ❌");
      return;
    }
    if (passtext !== passtextControl) {
      alert("Paroles nesakrīt ❌");
      return;
    } 
    if (email.length < 10 || email.length > 40 || !email.includes("@"))  {
      setResultArea("E-pasta garums nav derīgs. ❌");
      return;
    }
    if (passtext.length > 40 || passtext.length < 6) {
      setResultArea("Paroles garumam jābūt no 6 līdz 40 rakstzīmēm. ❌");
      return;
    }
    if (passtextControl.length > 40 || passtextControl.length < 6) {
      setResultArea("Paroles apstiprinājuma garums nav derīgs. ❌");
      return;
    }
    if (secretWord.length > 40 || secretWord.length < 4) {
      setResultArea("Slepenā vārda garumam jābūt no 6 līdz 40 rakstzīmēm. ❌");
      return;
    }
    if (name.trim().length < 3 || name.trim().length > 40) {
      setResultArea("Vārda garumam jābūt no 3 līdz 40 rakstzīmēm. ❌");
      return;
    }
    if (String(telephone).length < 7 || String(telephone).length > 15) {
      setResultArea("Tālruņa numuram jābūt no 8 līdz 15 cipariem. ❌");
      return;
    }
    // prevent duplicates
    if (isSaving.current) return; 
    isSaving.current = true;
    setSavingButton(true);
    setResultArea("");

    try {
      const registerObject = {
        registerName: name.trim(), 
        registerTelephone: Number(telephone), 
        registerEmail: email.trim(), 
        registerPasstext: passtext.trim(),
        registerSecretWord: secretWord.trim()
      };

      const res1 = await axios.post("http://localhost:5000/api/register", registerObject);
      setResultArea(res1.data.resMessage);
      
      // Servers sends ok message and token upon successful login,
      // and we save token in localStorage
      if (res1.data.resToken) {
        localStorage.setItem("token_livorent", res1.data.resToken);
        localStorage.setItem("visitorNumber", res1.data.resVisitorNumber);
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
        const errorCode = error.response.data.resErrorCode;
        const resMessage = error.response.data.resMessage;

        if (errorCode === 1) {
          setResultArea("Nepareizs pieprasījuma formāts. ❌");
        } else if (errorCode === 2) {
          setResultArea("Lūdzu, aizpildiet visus laukus. ❌");
        } else if (errorCode === 3) {
          setResultArea("Nederīgs e-pasta formāts. ❌");
        } else if (errorCode === 4) {
          setResultArea("Parolei jābūt vismaz 6 simbolu garai. ❌");
        } else if (errorCode === 5) {
          setResultArea("Slepenais vārds ir par īsu. ❌");
        } else if (errorCode === 6) {
          setResultArea("Vārds ir obligāts. ❌");
        } else if (errorCode === 7) {
          setResultArea("Nederīgs tālruņa numurs. ❌");
        } else if (errorCode === 8) {
          setResultArea("Šis e-pasts jau ir reģistrēts. Mēģiniet pieteikties vai izmantot citu e-pastu. ❌");
        } else if (errorCode === 9) {
          setResultArea("Radās servera kļūda. Mēģiniet vēlreiz vēlāk. ❌");
        } else if (errorCode === 11) {
          setResultArea("Lūdzu, mēģiniet vēlreiz pēc 2 minūtēm.  ❌");
        } else {
          setResultArea(resMessage || "Nezināma kļūda pie reģistrācijas. ❌");
        }

        console.warn("Kļūda pie reģistrācijas:", resMessage);
      } else {
        setResultArea("Reģistrācijas kļūda: serveris neatbild. ❌");
        console.error("Unhandled signup error:", error.message);
      }
    } finally {
      isSaving.current = false;
      setSavingButton(false);
    }
  }

  const toggleEye = (n) => {
    if (n === 1) {
      setShowPassword1(!showPassword1);
    } else if(n === 2) {
      setShowPassword2(!showPassword2);
    } else if(n === 3) {
      setShowPassword3(!showPassword3);
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
              <div className="loginInputsInputArea"> 
                <input className="loginInputShort" type={showPassword1 ? "text" : "password"} 
                  id="inputPasstext" autoComplete="off"
                  value={passtext} onChange={(e) => setPasstext(e.target.value)} required  />
                <img className="iconEye" src='/svg_eye.svg' onClick={()=> toggleEye(1)} alt='eye to see password'/>
              </div>
            </div>
            <div className="loginInputs">
              <label htmlFor="inputPasstextControl">Atkārtot paroli:</label>
              <div className="loginInputsInputArea">
                <input className="loginInputShort" type={showPassword2 ? "text" : "password"} 
                  id="inputPasstextControl" autoComplete="off"
                  value={passtextControl} onChange={(e) => setPasstextControl(e.target.value)} required  />
                <img className="iconEye" src='/svg_eye.svg' onClick={()=> toggleEye(2)} alt='eye to see password'/>
              </div>

            </div>
            <div className="loginInputs">
              <label htmlFor="inputSecretWord">Kā sauc jūsu labāko draugu bērnībā?</label>
              <div className="loginInputsInputArea">
                <input className="loginInputShort" type={showPassword3 ? "text" : "password"} 
                  id="inputSecretWord" autoComplete="off"
                  value={secretWord} onChange={(e) => setSecretWord(e.target.value)} required />
                <img className="iconEye" src='/svg_eye.svg' onClick={()=> toggleEye(3)} alt='eye to see password'/>
              </div>
              <small><em>Šo atbildi izmantosim, lai pārbaudītu jūsu identitāti, ja aizmirstat paroli.</em></small>
            </div>
          <button className="btnSelectCategory2" type="submit" disabled={savingButton} >
            {isSaving.current ? "Lūdzu uzgaidiet..." : "Reģistrēties"}
          </button>
        </form>
        <br/>
        <div className="resultAreaRegister">{resultArea}</div>
      </div>
      <br /><br /><br /><br /><br /><br /><br /><br />
      <Footer />
    </div>
  )
}

export default BtmRegister