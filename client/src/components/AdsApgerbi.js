import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/AdsMain.css";
import "../styles/tableMain.css";
import Footer from "./Footer.js";
import { useNavigate } from 'react-router-dom';

function AdsApgerbi() {
  const navigate = useNavigate();

  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [errorFrontend, setErrorFrontend] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get/adsbycategory/4`);
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
          <span className='adsMainSVG'><img src='/svg_dress.svg' alt='Dress and shoes icon'/></span>
          <span className='adsMainTitle'>Apģērbi, apavi</span>
        </div>
        <div className='adsListArea'>
            <span onClick={() => navigate("/section/41")}>Sieviešu apģērbi</span>
            <span onClick={() => navigate("/section/42")}>Vīriešu apģērbi</span>
            <span onClick={() => navigate("/section/43")}>Sieviešu apavi</span>
            <span onClick={() => navigate("/section/44")}>Vīriešu apavi</span>
            <span onClick={() => navigate("/section/45")}>Aksesuāri</span>
            <span onClick={() => navigate("/section/46")}>Sieviešu somiņas</span>
            <span onClick={() => navigate("/section/47")}>Mugursomas un Čemodāni</span>
            <span onClick={() => navigate("/section/48")}>Un vēl...</span>
        </div> 
      </div>
      <br/><br/><br/>
      <div>
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
                          <tr key={record.id} className='tableRows'>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='imgContainerTd'>
                               <img src={record.image_url[0]} alt='small pic of advertisement'/>
                            </td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cell2'>{record.title}</td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cell3'>{record.description}</td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cell4'>{record.price}</td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cell5'>{record.city}</td>
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