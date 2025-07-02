import {useState, useRef} from "react";
import axios from "axios";
import "../styles/Login.css";
import Footer from "./Footer";
import useUserStore from '../store/userStore'; // Adjust path accordingly

function BtmPasswordChange() { 
  const isSaving = useRef(false);  // flag to prevent repetitive requests and duplicates

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [passtext, setPasstext] = useState("");
  const [passtextControl, setPasstextControl] = useState("");
  const [resultArea, setResultArea] = useState("");
  const [savingButton, setSavingButton] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showPassword3, setShowPassword3] = useState(false);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setResultArea("");
    if (passtext !== passtextControl) {
      setResultArea("Paroles nesakrīt. ❌");
      return;
    }

    if (!email || !currentPassword || !passtext) {
      setResultArea("Lūdzu, ievadiet gan e-pastu, gan pašreizējo paroli. ❌");
      return;
    }

    if (email.length > 40 || email.length < 10) {
      setResultArea("E-pasta garums nav derīgs. ❌");
      return;
    }

    if (passtext.length > 40 || passtext.length < 6) {
      setResultArea("Jaunās paroles garums nav derīgs. ❌");
      return;
    }

    if (currentPassword.length > 40 || currentPassword.length < 6) {
      setResultArea("Vecās paroles garums nav derīgs. ❌");
      return;
    }

    // prevent duplicates
    if (isSaving.current) return; 
    isSaving.current = true;
    setSavingButton(true);
    try {  
      const changeObject = {
        changeEmail: email.trim(),
        changePasstext: passtext.trim(),
        changeCurrentPassword: currentPassword.trim()
      };
      const res1 = await axios.post("http://localhost:5000/api/post/password-change", changeObject);

      const { resToken, resNumber, resStatus, resUser, resMessage } = res1.data;
      if (resStatus === true) {
        setResultArea(`${resMessage} ✅`);
        // Small delay before navigation to allow store update
        setEmail("");
        setCurrentPassword("");
        setPasstext("");
        setPasstextControl("");
      }
    } catch (error) {
      if (error.response) {
        const { resMessage, resErrorCode } = error.response.data || {};
        let message = "Radās neparedzēta kļūda. ❌";
        
        if (resErrorCode === 1) {
          message = "Lietotājs ar šo e-pasta adresi nav atrasts. ❌";
        } else if (resErrorCode === 2) {
          message = "Pašreizējā parole ir nepareiza. ❌";
        } else if (resErrorCode === 3) {
          message = "Neizdevās atjaunināt paroli. Mēģiniet vēlreiz. ❌";
        } else if (resErrorCode === 4) {
          message = "Servera kļūda. Mēģiniet vēlāk. ❌";
        } else if (resErrorCode === 5) {
          message = "Visi lauki ir obligāti aizpildāmi. ❌";
        } else if (resErrorCode === 6) {
          message = "Jaunajai parolei jāatšķiras no pašreizējās. ❌";
        } else if (resErrorCode === 11) {
          message = "Lūdzu, mēģiniet vēlreiz pēc 2 minūtēm.  ❌";
        } else if (resMessage) {
          message = resMessage;
        }

        setResultArea(message);
        console.error("Servera kļūdas atbilde:", error.response.data);
      } else {
        setResultArea("Tīkla vai servera savienojuma kļūda. ❌");
        console.error("Pieprasījums neizdevās:", error.message);
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
            <button className="btnSelectCategory2" type="submit" disabled={savingButton}>
              {isSaving.current ? "Apstrādā..." : "Saglabāt"}
            </button>
          </form>
          <br/>
          <div className="resultAreaChange">{resultArea}</div>
        </div>
        <br /><br /><br /><br /><br /><br /><br /><br />
        <Footer />
      </div>
  )
}

export default BtmPasswordChange