import React from 'react';
import "../styles/AdsMain.css";

function AdsTransport() {
  return (
    <div>
      <div className='adsMainArea'>
        <div className='adsTopArea'>
          <span className='adsMainSVG'><img src='/svg_car2.svg' alt='Car icon'/></span>
          <span className='adsMainTitle'>Transportlīdzekļi</span>
        </div>
        <div className='adsListArea'>
            <span>Vieglie auto</span>
            <span>Velosipēdi, skūteri</span>
            <span>Kravas automašīnas</span>
            <span>Traktori</span>
            <span>Lauksaimniecības mašīnas</span>
            <span>Piekabes</span>
            <span>Jumta kastes</span>
            <span>Ūdens transports</span>
            <span>Citi...</span>
        </div>
      </div>
    </div>
  )
}

export default AdsTransport;