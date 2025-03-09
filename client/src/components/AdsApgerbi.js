import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/AdsMain.css";
import "../styles/tableMain.css";
import Footer from "./Footer.js";

function AdsApgerbi() {
  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [error, setError] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get/adsbycategory/4`);
        setMessage(response.data);
      } catch (error) {
        console.log(error.message);
        setError("Error happened");
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  if (error) {
    return <div>{error}</div>; // Display error message
  }

  return (
    <div>
      <div className='adsMainArea'>
        <div className='adsTopArea'>
          <span className='adsMainSVG'><img src='/svg_dress.svg' alt='Dress and shoes icon'/></span>
          <span className='adsMainTitle'>Apģērbi, apavi</span>
        </div>
        <div className='adsListArea'>
            <span>Sieviešu apģērbi</span>
            <span>Vīriešu apģērbi</span>
            <span>Sieviešu apavi</span>
            <span>Vīriešu apavi</span>
            <span>Aksesuāri</span>
            <span>Sieviešu somiņas</span>
            <span>Mugursomas un Čemodāni</span>
            <span>Citi...</span>
        </div> 
      </div>
      <div className='resultArea'>
        { loading ? 
            <div aria-live="polite">Loading...</div> 
          :
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
                            <td>{record.title}</td>
                            <td>{record.description}</td>
                            <td>{record.price}</td>
                            <td>{record.city}</td>
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

export default AdsApgerbi;