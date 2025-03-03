import React from 'react';
import "../styles/AdsMain.css";

function AdsHobi() {
  return (
    <div>
      <div className='adsMainArea'>
        <div className='adsTopArea'>
          <span className='adsMainSVG'><img src='/svg_camping.svg' alt='Hobby icon'/></span>
          <span className='adsMainTitle'>Hobijs</span>
        </div>
        <div className='adsListArea'>
            <span>Sporta aprīkojums</span>
            <span>Medības, kempings</span>
            <span>Mūzikas instrumenti</span>
            <span>Slidošana</span>
            <span>Rokdarbi</span>
            <span>Citi...</span>
        </div>
          
      </div>
    </div>
  )
}

export default AdsHobi;