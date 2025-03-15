import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Login.css";
import Footer from "./Footer";

function BtmLogin() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [passtext, setPasstext] = useState("");
  const [resultArea, setResultArea] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginObject = {
        loginEmail: email, 
        loginPasstext: passtext
      };
      console.log(loginObject);


      const formData = new FormData();
      //formData is a key-value pair. And loginData is the name we have chosen for the key.
      formData.append("loginData", JSON.stringify(loginObject)); // Send ad data as JSON string

      const res1 = await axios.post("http://localhost:5000/api/login", formData, {
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
                <input className="loginInputShort" type="text" id="inputPasstext"
                  value={passtext} onChange={(e) => setPasstext(e.target.value)} required  />
              </div>
              
            <button className="btnSelectCategory2" type="submit">Ieiet</button>
          </form>
          <div>{resultArea}</div>
        </div>
        <br /><br /><br /><br /><br /><br /><br /><br />
        <Footer />
      </div>
  )
}

export default BtmLogin