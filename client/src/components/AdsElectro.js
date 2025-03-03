import React from 'react';
import "../styles/AdsMain.css";

function AdsElectro() {
  return (
    <div>
      <div className='adsMainArea'>
        <div className='adsTopArea'>
          <span className='adsMainSVG'><img src='/svg_laptop.svg' alt='Instruments and Electronics icon'/></span>
          <span className='adsMainTitle'>Instrumenti, elektronika</span>
        </div>
        <div className='adsListArea'>
          <span>Telefoni</span>
          <span>Datori</span>
          <span>Virtuves tehnika</span>
          <span>Biroja tehnika</span>
          <span>Baterijas, Akumulatori</span>
          <span>Apgaismojums, Televizori</span>
          <span>Foto un optika</span>
          <span>Dārza tehnika</span>
          <span>Citi...</span>
        </div>
      </div>
    </div>
  )
}

export default AdsElectro;