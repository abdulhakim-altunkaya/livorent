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
      const res1 = await axios.post("http://localhost:5000/api/login", loginObject);
      setResultArea(res1.data.myMessage);
      // Servers sends ok message and token upon successful login,
      // and we save token in localStorage
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
        setResultArea("Error happened login, no data from backend");
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