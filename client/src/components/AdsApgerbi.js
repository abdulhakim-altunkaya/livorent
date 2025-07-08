import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/AdsMain.css";
import "../styles/tableMain.css";
import Footer from "./Footer.js";
import { useNavigate } from 'react-router-dom';

function AdsApgerbi() {
  const navigate = useNavigate();

  const [ads, setAds] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorFrontend, setErrorFrontend] = useState(null);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/get/adsbycategory/4?offset=${offset}&limit=5`);
      const newAds = response.data;
      if (newAds.length < 5) setHasMore(false);
      setAds(prevAds => {
        const existingIds = new Set(prevAds.map(ad => ad.id));
        const uniqueNewAds = newAds.filter(ad => !existingIds.has(ad.id));
        return [...prevAds, ...uniqueNewAds];
      });
      setOffset(prevOffset => prevOffset + 5);
    } catch (error) {
      setErrorFrontend("Kļūda: neizdevās ielādēt sludinājumus. Pārbaudiet interneta savienojumu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds(); // Load initial ads
  }, []);

  return (
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
        {errorFrontend ? (
          <p className='errorFieldAdsMain'>{errorFrontend}</p>
        ) : (
          <>
            <div className='tableMainCategoryArea'>
              <table className='tableMainCategory'>
                <thead>
                  <tr>
                    <th className='column1'></th>
                    <th className='column2'>Sludinājumi</th>
                    <th className='column3'>Informācija</th>
                    <th className='column4'>Cena</th>
                    <th className='column5'>Pilsēta</th>
                    <th className='column5'>Datums</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map(record => (
                    <tr key={record.id} className='tableRows'>
                      <td onClick={() => navigate(`/item/${record.id}`)} className='imgContainerTd'>
                        <img src={record.image_url[0]} alt='small pic of advertisement' />
                      </td>
                      <td onClick={() => navigate(`/item/${record.id}`)} className='cell2'>
                        {record.title.length > 60 ? `${record.title.slice(0, 60)}...` : record.title}
                      </td>
                      <td onClick={() => navigate(`/item/${record.id}`)} className='cell3'>
                        {record.description.length > 200 ? `${record.description.slice(0, 200)}...` : record.description}
                      </td>
                      <td onClick={() => navigate(`/item/${record.id}`)} className='cell4'>{record.price}</td>
                      <td onClick={() => navigate(`/item/${record.id}`)} className='cell5'>{record.city}</td>
                      <td onClick={() => navigate(`/item/${record.id}`)} className='cell6'>{record.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasMore && !loading && (
              <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <button onClick={fetchAds} className="loadMoreBtn">Ielādēt vēl</button>
              </div>
            )}

            {loading && (
              <p style={{ textAlign: "center", marginTop: "1rem" }}>Notiek ielāde...</p>
            )}
          </>
        )}
      </div>

      <br /><br /><br /><br /><br /><br />

      <div className='FooterContainer'>
        <Footer />
      </div>
    </div>
  );
}

export default AdsApgerbi;
