import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import "../styles/AdsMain.css";
import "../styles/tableMain.css";
import Footer from "./Footer.js";
import { useNavigate } from 'react-router-dom';

function AdsApgerbi() {
  const navigate = useNavigate();

  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [errorFrontend, setErrorFrontend] = useState(null); // Add error state
  const isSaving = useRef(false);  // flag to prevent repetitive requests and duplicates

  useEffect(() => {
    const getData = async () => {
      // prevent re-rendering
      if (isSaving.current) return; 
      isSaving.current = true;
      try {
          const response = await axios.get(`http://localhost:5000/api/get/adsbycategory/4`);
          const data = response.data;

          if (data.resStatus && Array.isArray(data.resData)) {
            if (data.resData.length === 0) {
              setErrorFrontend("Šajā kategorijā nav sludinājumu.");
            } else {
              setMessage(data.resData);  // This is your actual ads array
            }
          } else {
            // Handle unexpected empty or malformed data
            setErrorFrontend("Neizdevās ielādēt sludinājumus.");
            console.log("Backend returned unexpected structure:", data);
          }
        } catch (error) {
          if (error.response && error.response.data) {
            const backendError = error.response.data;
            if (backendError.resErrorCode === 1) {
              setErrorFrontend("Kļūda: kategorija nav norādīta.");
            } else if (backendError.resErrorCode === 2) {
              setErrorFrontend("Kļūda: datu bāzes savienojuma problēma.");
            } else {
              setErrorFrontend("Nezināma servera kļūda.");
            }
            console.log("Backend error:", backendError.resMessage);
          } else {
            setErrorFrontend("Kļūda: neizdevās izveidot savienojumu ar serveri.");
            console.log("Network error:", error.message);
          }
        } finally {
          isSaving.current = false;
        }
      };
    getData();
  }, []);


  return (
    <>
    <div>
      <div className='adsMainArea'>
        <div className='adsTopArea'>
          <span className='adsMainSVG'>
            <img src='/svg_dress.svg' alt='Dress and shoes icon' />
          </span>
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

      <br /><br /><br />

      <div>
        { isSaving.current ? 
            <div aria-live="polite">Notiek ielāde...</div> 
          : errorFrontend ? ( // Check for error first
            <p className='errorFieldAdsMain'>{errorFrontend}</p>
          ) :
            <>
              {Array.isArray(message) && message.length > 0  ? (
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
                  <div className="tableMainCategoryAreaSmall"> 
                    <table className="tableMainCategory">
                      <thead> 
                        <tr>
                          <th className="column1" scope="col"></th>
                          <th className="column2" scope="col">Sludinājumi</th>
                          <th className="column3" scope="col">Informācija</th>
                        </tr>
                      </thead>
                      <tbody>
                        {message.map((record) => (
                          <tr key={record.id} className="tableRows">
                            <td onClick={() => navigate(`/item/${record.id}`)} className="imgContainerTd">
                              <img src={record.image_url[0]} alt="small pic of advertisement" />
                            </td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className="cell2"> 
                              <strong>{record.title.length > 60 ? `${record.title.substring(0, 60)}...` : record.title}</strong> 
                              <br/>
                              <em>{record.description.length > 40 ? `${record.description.substring(0, 40)}...` : record.description}</em>
                            </td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className="cell4">
                              {record.price} <br/><br/>
                              {record.city} <br/><br/>
                              {record.date}
                            </td>
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
    </div>
    <br/><br/><br/><br/><br/><br/>
    <Footer />
    </>
  )
}

export default AdsApgerbi;
