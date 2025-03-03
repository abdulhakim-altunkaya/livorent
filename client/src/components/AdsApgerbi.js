import React from 'react';
import "../styles/AdsMain.css";

function AdsApgerbi() {
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
    </div>
  )
}

export default AdsApgerbi;