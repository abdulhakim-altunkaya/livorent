import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/AdsMain.css";

function AdsApgerbi() {
  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [error, setError] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get/adsbycategory/4`);
        console.log(response.data);
      } catch (error) {
        console.log(error.message);
        setError("Error happened");
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
        {message}
      </div>
    </div>
  )
}

export default AdsApgerbi;