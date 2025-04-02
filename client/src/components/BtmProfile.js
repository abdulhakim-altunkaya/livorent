import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/Profile.css";
import Footer from "./Footer.js";
import { useParams, useNavigate } from "react-router-dom";

function BtmProfile() {
  const navigate = useNavigate()

  const { visitorNumber } = useParams();
  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [userData, setUserData] = useState(null);
  const [errorFrontend, setErrorFrontend] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get/adsbyuser/${visitorNumber}`);
        setMessage(response.data);     

        const responseUser = await axios.get(`http://localhost:5000/api/get/userdata/${visitorNumber}`);
        setUserData(responseUser.data);


      } catch (error) {
        setErrorFrontend("Error: ads could not be fetched");
        console.log(error.message);
        setUserData({}); // Ensure userData is never null
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [visitorNumber]);

  const deleteAccount = () => {
    alert("Accounts which are inactive for 6 months will be deleted together with their ads if any");
    return;
  }

  const signoutAccount = () => {
    alert("signout button clicked");
    return;  
  }

  return (
    <div>
      { loading ? 
        ( <div>lietotāja informācijas ielāde</div> )
          :
        ( 
        <div className='userInfoArea'>
          <div className='welcomeMessageProfile'>laipni lūdzam </div> 

          <div><strong>Name:</strong> {userData.name}</div>
          <div><strong>E-mail:</strong> {userData.email}</div>
          <div><strong>Telephone:</strong> {userData.telephone}</div>
          <div className='lastDivProfile'><strong>Member since:</strong> {userData.date}</div>

          <div className='profileButtonsArea'>
            <span><button className='button-54' onClick={signoutAccount}>Sign out</button></span>
            <span><button className='button-54'
              onClick={() => navigate(`/profile/update-account/${visitorNumber}`)}>Update Account</button></span>
            <span><button className='button-54' onClick={deleteAccount}>Delete Account</button></span>
          </div>
        </div>
        )
      }
      <div>
        { loading ? 
            <div aria-live="polite">Loading...</div> 
          : errorFrontend ? ( // Check for error first
            <p className='errorFieldProfile'>{errorFrontend}</p>
          ) :
            <>
              {message && message.length > 0  ? (
                <>
                  <div className='tableProfileArea'>
                    <table className='tableMainCategory'>
                      <thead>
                        <tr>
                          <th className='columnProfile1' scope="col"></th>
                          <th className='columnProfile2' scope="col">Sludinājumi</th>
                          <th className='columnProfile3' scope="col">Informācija</th>
                          <th className='columnProfile4' scope="col">Cena</th>
                          <th className='columnProfile5' scope="col">Pilsēta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {message.map( record => (
                          <tr key={record} className='tableRowsProfile'>
                            <td className='imgContainerCell'> <img src={record.image_url[0]} alt='a small pic of ad'/></td>
                            <td className='cellProfile2'>{record.title}</td>
                            <td className='cellProfile3'>{record.description}</td>
                            <td className='cellProfile4'>{record.price}</td>
                            <td className='cellProfile5'>{record.city}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="noAdsMessage">
                  <p>Jums vēl nav sludinājumu</p> {/* "You don't have any ads yet" in Latvian */}
                </div>
              )}
            </>
        }
      </div>
      <br/><br/><br/><br/><br/><br/>
      <div className='FooterContainer'>
        <Footer />
      </div>
    </div>
  )
}

export default BtmProfile