import React, {useState, useEffect} from "react";
import { useNavigate, useParams, useLocation  } from "react-router-dom";
import axios from "axios";
import "../styles/ProfileUpdate.css";
import Footer from "./Footer";
import useUserStore from '../store/userStore';
import { jwtDecode } from 'jwt-decode';

function BtmProfileUpdate() { 
  const navigate = useNavigate();
  const { visitorNumber } = useParams();

  const { state } = useLocation(); //this data is coming from BtmProfile component. It contains userData.
  //we used keyword "state" here. You can think this keyword as a variable pointing userData. userData values 
  //are coming through navigate. Thats why useLocation also uses react router dom.
  const { userData } = state || {}; // Fallback in case state is undefined
  
  const [name, setName] = useState(userData.name);
  const [telephone, setTelephone] = useState(userData.telephone);
  const [email, setEmail] = useState(userData.email);
  const [passtext, setPasstext] = useState("");
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

    try {
      const updateObject = {
        updateId: Number(visitorNumber),
        updateName: name, 
        updateTelephone: telephone, 
        updateEmail: email, 
        updatePasstext: passtext
      }; 

      const res1 = await axios.post("http://localhost:5000/api/update", updateObject, 
        {headers: {Authorization: `Bearer ${token}`}}
      );
      setResultArea(res1.data.myMessage);
      // Servers sends ok message and token upon successful update,
      // and we save token in localStorage
      if (res1.data.token) {
        localStorage.setItem("token_livorent", res1.data.token); // Save the token 
        localStorage.setItem("visitorNumber", Number(res1.data.visitorNumber)); //save the user id
        alert("atjaunināšana ir veiksmīga")
        navigate(`/profile/${res1.data.visitorNumber}`); // Include visitorNumber in the URL
      }

    } catch (error) {
      if (error.response) {
        setResultArea(error.response.data.myMessage);
        console.log(error.message);
      } else {
        setResultArea("Error happened while signup, no data from backend");
        console.log(error.message);
      }
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
            <div className="loginInputs1">
              <label htmlFor="inputPasstext1">Parole:</label>
              <input className="loginInputShort1" type="text" id="inputPasstext1" autoComplete="off"
                value={passtext} onChange={(e) => setPasstext(e.target.value)} required  />
            </div>
          <button className="btnSelectCategory3" type="submit">Atjaunināt</button>
          <span className="btnSelectCategory4" onClick={cancelUpdate}>Atcelt</span>
        </form>
        <div>{resultArea}</div>
      </div>
      <br /><br /><br /><br /><br /><br /><br /><br />
      <Footer />
    </div>
  )
}

export default BtmProfileUpdate