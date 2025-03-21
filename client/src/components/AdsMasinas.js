import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/AdsMain.css";
import "../styles/tableMain.css";
import Footer from "./Footer.js";

function AdsMasinas() {
  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [errorFrontend, setErrorFrontend] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get/adsbycategory/1`);
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
      <div className='adsMainArea'>
        <div className='adsTopArea'>
          <span className='adsMainSVG'><img src='/svg_machine.svg' alt='Machine and Construction icon'/></span>
          <span className='adsMainTitle'>Mašīnas, būvniecība</span>
        </div>
        <div className='adsListArea'>
            <span>Masti, torņi, konstrukcijas</span>
            <span>Santehnika</span>
            <span>Kompresori</span>
            <span>Pārvadāšana un iekraušana</span>
            <span>Ģeneratori</span>
            <span>Mērinstrumenti</span>
            <span>Mazgāšanas aprīkojums</span>
            <span>Citi...</span>
        </div> 
      </div>
      <br/><br/><br/>
      <div className='resultArea'>
        { loading ? 
            <div aria-live="polite">Loading...</div> 
          : errorFrontend ? ( // Check for error first
            <p className='errorFieldAdsMain'>{errorFrontend}</p>
          ) :
            <>
              {message ? (
                <>
                  <div className='tableMainCategoryArea'>
                    <table className='tableMainCategory'>
                      <thead>
                        <tr>
                          <th className='column1' scope="col"></th>
                          <th className='column2' scope="col">Sludinājumi</th>
                          <th className='column3' scope="col">Informācija</th>
                          <th className='column4' scope="col">Cena</th>
                          <th className='column5' scope="col">Pilsēta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {message.map( record => (
                          <tr key={record} className='tableRows'>
                            <td className='imgContainerTd'> <img src={record.image_url[0]} alt='an image representing the ad'/></td>
                            <td className='cell2'>{record.title}</td>
                            <td className='cell3'>{record.description}</td>
                            <td className='cell4'>{record.price}</td>
                            <td className='cell5'>{record.city}</td>
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

export default AdsMasinas;