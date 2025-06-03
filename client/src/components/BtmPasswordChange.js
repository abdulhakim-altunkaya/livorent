import React, {useState, useEffect} from "react";
import axios from "axios";
import "../styles/Login.css";
import Footer from "./Footer";
import useUserStore from '../store/userStore'; // Adjust path accordingly

function BtmPasswordChange() { 

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [passtext, setPasstext] = useState("");
  const [passtextControl, setPasstextControl] = useState("");
  const [resultArea, setResultArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword3, setShowPassword3] = useState(false);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setResultArea("");
    if (passtext !== passtextControl) {
      setResultArea("Passwords do not match.");
      return;
    }

    if (!email || !currentPassword) {
      setResultArea("Please enter both email and current password.");
      return;
    }
    setLoading(true);
    try {  
      const changeObject = {
        changeEmail: email.trim(),
        changePasstext: passtext.trim(),
        changeCurrentPassword: currentPassword.trim()
      };
      const res1 = await axios.post("http://localhost:5000/api/post/password-change", changeObject);

      const { resToken, resNumber, resStatus, resUser, resMessage } = res1.data;
      if (resStatus === true) {
        setResultArea(resMessage);
        // Small delay before navigation to allow store update
        setEmail("");
        setCurrentPassword("");
        setPasstext("");
        setPasstextControl("");
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
    } finally {
      setLoading(false);
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
        <span className="titlePasswordReset">Paroles maiņa</span>
        <div className="loginFormArea">
          <form className="loginForm" onSubmit={handleSubmit}>
            <div className="loginInputs">
              <label htmlFor="inputEmail">E-pasts:</label>
              <input className="loginInputShort" type="email" id="inputEmail" 
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="loginInputs">
              <label htmlFor="inputCurrentPassword">Pašreizējā parole</label>
              <div className="loginInputsInputArea">
                <input className="loginInputShort" type={showPassword1 ? "text" : "password"}  
                  id="inputCurrentPassword" autoComplete="off"
                  value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                <img className="iconEye" src='/svg_eye.svg' onClick={()=> toggleEye(1)} 
                  role="button" tabIndex="0" alt='eye to see password'/>
              </div>
            </div>
            <div className="loginInputs">
              <label htmlFor="inputPasstext">Jauna parole:</label>
              <div className="loginInputsInputArea">
                <input className="loginInputShort" type={showPassword2 ? "text" : "password"} 
                  id="inputPasstext" autoComplete="off"
                  value={passtext} onChange={(e) => setPasstext(e.target.value)} required  />
                <img className="iconEye" src='/svg_eye.svg' onClick={()=> toggleEye(2)} 
                  role="button" tabIndex="0" alt='eye to see password'/>
              </div>
            </div>
            <div className="loginInputs">
              <label htmlFor="inputPasstextControl">Atkārtot jauno paroli:</label>
              <div className="loginInputsInputArea">
                <input className="loginInputShort" type={showPassword3 ? "text" : "password"} 
                  id="inputPasstextControl" autoComplete="off"
                  value={passtextControl} onChange={(e) => setPasstextControl(e.target.value)} required  />
                <img className="iconEye" src='/svg_eye.svg' onClick={()=> toggleEye(3)} 
                  role="button" tabIndex="0" alt='eye to see password'/>
              </div>
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

export default BtmPasswordChange