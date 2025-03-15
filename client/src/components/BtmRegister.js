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
    try {
      const registerObject = {
        registerName: name, 
        registerTelephone: telephone, 
        registerEmail: email, 
        registerPasstext: passtext
      };
      console.log(registerObject);

      const formData = new FormData();
      //formData is a key-value pair. And registerData is the name we have chosen for the key.
      formData.append("registerData", JSON.stringify(registerObject)); // Send ad data as JSON string

      const res1 = await axios.post("http://localhost:5000/api/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResultArea(res1.data.myMessage);

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