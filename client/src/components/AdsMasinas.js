import React from 'react';
import "../styles/AdsMain.css";

function AdsMasinas() {
  return (
    <div>
      <div className='adsMainArea'>
        <div className='adsTopArea'>
          <span className='adsMainSVG'><img src='/svg_machine.svg' alt='Machine and Construction icon'/></span>
          <span className='adsMainTitle'>Mašīnas, būvniecība</span>
        </div>
        <div className='adsListArea'>
            <span>Masti, torņi, konstrukcijas</span>
            <span>Santehnika</span>
            <span>Kompresori</span>
            <span>Pārvadāšana un iekraušana</span>
            <span>Ģeneratori</span>
            <span>Mērinstrumenti</span>
            <span>Mazgāšanas aprīkojums</span>
            <span>Citi...</span>
        </div>
          
      </div>
    </div>
  )
}

export default AdsMasinas