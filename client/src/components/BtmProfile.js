import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/Profile.css";
import Footer from "./Footer.js";
import { useParams } from "react-router-dom";

function BtmProfile() {
  const { visitorNumber } = useParams();
  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [errorFrontend, setErrorFrontend] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get/adsbyuser/${visitorNumber}`);
        setMessage(response.data);
      } catch (error) {
        setErrorFrontend("Error: ads could not be fetched");
        console.log(error.message)
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  return (
    <div>
      <div>
        { loading ? 
            <div aria-live="polite">Loading...</div> 
          : errorFrontend ? ( // Check for error first
            <p className='errorFieldProfile'>{errorFrontend}</p>
          ) :
            <>
              {message ? (
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
                            <td className='imgContainerCell'> <img src={record.image_url[0]} alt='an image representing the ad'/></td>
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
                <p>No data available</p> // Handle case where message is null or empty
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