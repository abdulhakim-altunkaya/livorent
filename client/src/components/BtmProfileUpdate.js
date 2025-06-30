import {useState, useEffect, useRef} from "react";
import { useNavigate, useParams, useLocation  } from "react-router-dom";
import axios from "axios";
import "../styles/ProfileUpdate.css";
import Footer from "./Footer";
import { jwtDecode } from 'jwt-decode';
import useUserStore from '../store/userStore';

function BtmProfileUpdate() { 
  const navigate = useNavigate();
  const isSaving = useRef(false);  // flag to prevent repetitive requests and duplicates

  const { visitorNumber } = useParams();

  const { state } = useLocation(); //this data is coming from BtmProfile component. It contains userData.
  //we used keyword "state" here. You can think this keyword as a variable pointing userData. userData values 
  //are coming through navigate. Thats why useLocation also uses react router dom.
  const { userData } = state || {}; // Fallback in case state is undefined
  
  const [name, setName] = useState(userData.name);
  const [telephone, setTelephone] = useState(userData.telephone);
  const [email, setEmail] = useState(userData.email);
  const [resultArea, setResultArea] = useState("");
  const token = localStorage.getItem("token_livorent");
  
  useEffect(() => {
      //Check 1: Only people with token can open ad update page. 
      if (!token) {
        navigate("/login"); // Redirect if no token
        return;
      }
      //Check 2: People with inconsistent id numbers will be directed to login.
      try {
        const decoded = jwtDecode(token);
        const tokenUserId = decoded.userId;
        if (String(tokenUserId) !== String(visitorNumber)) {
          navigate("/login"); 
          return;
        }
      } catch (err) {
        console.error("Invalid token:", err);
        navigate("/login");
        return;
      }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault();


      
    // === Validation checks (similar to register endpoint) ===
    if (!name || !telephone || !email) {
      setResultArea("Neizpildīti lauki ❌"); // Missing fields
      return;
    }
    if (email.length < 10 || !email.includes("@") || email.trim().length > 40) {
      setResultArea("Nederīgs e-pasts ❌"); // Invalid email
      return;
    }
    if (name.trim().length < 2 ||  name.trim().length > 40) {
      setResultArea("Nepieciešams vārds ❌"); // Name too short
      return;
    }
    if (String(telephone).length < 7 || String(telephone).length > 15) {
      setResultArea("Nederīgs tālruņa numurs ❌"); // Invalid phone
      return;
    }

    // prevent duplicates
    if (isSaving.current) return; 
    isSaving.current = true;

    try {
      const updateObject = {
        updateId: Number(visitorNumber),
        updateName: name, 
        updateTelephone: Number(telephone), 
        updateEmail: email
      }; 
      const res1 = await axios.post("http://localhost:5000/api/update", updateObject, 
        {headers: {Authorization: `Bearer ${token}`}}
      );
      // Servers sends ok message upon successful update
      if (res1.data.resStatus) {
        setResultArea(`${res1.data.resMessage} ✅`);
        // Optional: Sync frontend state with DB-updated values (if needed)
        const { resUpdatedUser } = res1.data;
        if (resUpdatedUser) {
          setName(resUpdatedUser.name);
          setTelephone(resUpdatedUser.telephone);
          setEmail(resUpdatedUser.email);
        }
        useUserStore.getState().setCachedUserData({
          ...useUserStore.getState().cachedUserData, // keep existing fields
          name: resUpdatedUser.name,//name of cachedUserData is set to name of resUpdatedUser 
          telephone: resUpdatedUser.telephone,
          email: resUpdatedUser.email
        });
      } else {
        setResultArea("Atjaunināšana neizdevās ❌");
      }

    } catch (error) {
      if (error.response) {
        const { resMessage, resErrorCode } = error.response.data || {};
        let message = "Kļūda atjaunināšanā.";

        if (resErrorCode === 1) {
          message = "Lietotāja ID nav norādīts. ❌";
        } else if (resErrorCode === 2) {
          message = "Vārds nav derīgs. ❌";
        } else if (resErrorCode === 3) {
          message = "Telefona numurs nav derīgs. ❌";
        } else if (resErrorCode === 4) {
          message = "Nepieciešams derīgs e-pasts. ❌";
        } else if (resErrorCode === 5) {
          message = "Lietotājs nav atrasts vai atjaunināšana neizdevās. ❌";
        } else if (resErrorCode === 6) {
          message = "Datu bāzes kļūda. ❌";
        } else if (resMessage) {
          message = resMessage;
        }

        setResultArea(message);
        console.error("Server error response:", error.response.data);
      } else {
        setResultArea("Tīkls vai servera savienojuma kļūda. ❌");
        console.error("Request failed:", error.message);
      }
    } finally {
      isSaving.current = false;
    }
  }

  const cancelUpdate = () => {
    navigate(`/profile/${visitorNumber}`); // Include visitorNumber in the URL
  }

  return (
    <div>
      <h3 className="profileUpdateTitle">ATJAUNINIET SAVU KONTU</h3>
      <div className="loginFormArea1">
        <form className="loginForm1" onSubmit={handleSubmit}>
            <div className="loginInputs1">
              <label htmlFor="inputName1">Vārds:</label>
              <input className="loginInputShort1" type="text" id="inputName1"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="loginInputs1">
              <label htmlFor="inputTelephone1">Tālrunis:</label>  
              <input className="loginInputShort1" type="number" id="inputTelephone1" 
                value={telephone} onChange={(e) => setTelephone(e.target.value)} required />
            </div>
            <div className="loginInputs1">
              <label htmlFor="inputEmail1">E-pasts:</label>
              <input className="loginInputShort1" type="text" id="inputEmail1" 
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          <button className="btnSelectCategory3" type="submit" disabled={isSaving.current} >
            {isSaving.current ? "Saglabā..." : "Atjaunināt"}
          </button>
          <span className="btnSelectCategory4" onClick={cancelUpdate}>Atcelt</span>
        </form>
        <br/>
        <div className="resultAreaProfileUpdate">{resultArea}</div>
      </div>
      <br /><br /><br /><br /><br /><br /><br /><br />
      <Footer />
    </div>
  )
}

export default BtmProfileUpdate