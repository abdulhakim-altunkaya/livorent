import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";
import Footer from "./Footer";

function BtmRegister() {
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [passtext, setPasstext] = useState("");
  const [resultArea, setResultArea] = useState("");
  const [passtextControl, setPasstextControl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
      
    // Check if passwords match
    if (passtext !== passtextControl) {
      alert("passwords do not match")
      return; // Stop form submission
    }

    try {
      const registerObject = {
        registerName: name, 
        registerTelephone: telephone, 
        registerEmail: email, 
        registerPasstext: passtext
      };

      const res1 = await axios.post("http://localhost:5000/api/register", registerObject);
      setResultArea(res1.data.myMessage);
      
      // Save the token in localStorage
      if (res1.data.token) {
        localStorage.setItem("token_livorent", res1.data.token); // Save the token 
        localStorage.setItem("visitorNumber", Number(res1.data.visitorNumber)); //save the user id
        navigate(`/profile/${res1.data.visitorNumber}`); // Include visitorNumber in the URL
      }

    } catch (error) {
      if (error.response) {
        setResultArea(error.response.data.myMessage);
        console.log(error.message);
      } else {
        setResultArea("An error happened while saving the news");
        console.log(error.message);
      }
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
              <input className="loginInputShort" type="text" id="inputPasstext"
                value={passtext} onChange={(e) => setPasstext(e.target.value)} required  />
            </div>
            <div className="loginInputs">
              <label htmlFor="inputPasstextControl">Atkārtot paroli:</label>
              <input className="loginInputShort" type="text" id="inputPasstextControl"
                value={passtextControl} onChange={(e) => setPasstextControl(e.target.value)} required  />
            </div>
          <button className="btnSelectCategory2" type="submit">Reģistrēties</button>
        </form>
        <div>{resultArea}</div>
      </div>
      <br /><br /><br /><br /><br /><br /><br /><br />
      <Footer />
    </div>
  )
}

export default BtmRegister