import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/AdsMain.css";
import "../styles/tableMain.css";
import Footer from "./Footer.js";
import { useNavigate } from 'react-router-dom';

function AdsPasakumi() {
  const navigate = useNavigate();

  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [errorFrontend, setErrorFrontend] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get/adsbycategory/6`);
        setMessage(response.data);
      } catch (error) {
        setErrorFrontend("Kļūda: neizdevās ielādēt sludinājumus. Pārbaudiet interneta savienojumu.");
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
          <span className='adsMainSVG'><img src='/svg_event.svg' alt='Event organization icon'/></span>
          <span className='adsMainTitle'>Pasākumi</span>
        </div>
        <div className='adsListArea'>
          <span onClick={() => navigate("/section/61")}>Dekorācijas</span>
          <span onClick={() => navigate("/section/62")}>Dzīvnieki</span>
          <span onClick={() => navigate("/section/63")}>Mēbeles un Paklāji</span>
          <span onClick={() => navigate("/section/64")}>Inventārs aktīvai atpūtai</span>
          <span onClick={() => navigate("/section/65")}>Atrakciju noma</span>
          <span onClick={() => navigate("/section/66")}>Trauki, galda rīki</span>
          <span onClick={() => navigate("/section/67")}>Kostīmi</span>
          <span onClick={() => navigate("/section/68")}>Pirtis</span>
          <span onClick={() => navigate("/section/69")}>Un vēl...</span>
        </div> 
      </div>
      <br/><br/><br/>
      <div>
        { loading ? 
            <div aria-live="polite">Notiek ielāde...</div> 
          : errorFrontend ? ( // Check for error first
            <p className='errorFieldAdsMain'>{errorFrontend}</p>
          ) :
            <>
              {Array.isArray(message) && message.length > 0 ? (
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
                          <th className='column5' scope="col">Datums</th>
                        </tr>
                      </thead> 
                      <tbody>
                        {message.map(record => (
                          <tr key={record.id} className='tableRows'>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='imgContainerTd'>
                              <img src={record.image_url[0]} alt='small pic of advertisement'/>
                            </td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cell2'>
                              {record.title.length > 60 ? `${record.title.substring(0, 60)}...` : record.title}
                            </td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cell3'>
                              {record.description.length > 200 ? `${record.description.substring(0, 200)}...` : record.description}
                            </td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cell4'>{record.price}</td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cell5'>{record.city}</td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cell6'>{record.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className='errorFieldAdsMain'>Nav pieejamu datu</p> // Handle case where message is null or empty
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

export default AdsPasakumi;