import React from 'react';
import "../styles/AdsMain.css";

function AdsPasakumi() {
  return (
    <div>
      <div className='adsMainArea'>
        <div className='adsTopArea'>
          <span className='adsMainSVG'><img src='/svg_event.svg' alt='Event organization icon'/></span>
          <span className='adsMainTitle'>Pasākumi</span>
        </div>
        <div className='adsListArea'>
            <span>Dekorācijas</span>
            <span>Dzīvnieki</span>
            <span>Mēbeles un Paklāji</span>
            <span>Inventārs aktīvai atpūtai</span>
            <span>Atrakciju noma</span>
            <span>Trauki, galda rīki</span>
            <span>Kostīmi</span>
            <span>Pirtis</span>
            <span>Citi...</span>
        </div>
          
      </div>
    </div>
  )
}

export default AdsPasakumi;