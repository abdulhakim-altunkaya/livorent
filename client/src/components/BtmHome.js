import React from 'react';
import {useNavigate} from "react-router-dom";
import Footer from './Footer'; 
import "../styles/bottomOther.css"
import { Helmet } from "react-helmet";

function BottomHome() {
  
  const navigate = useNavigate();

  return (
    <div className='bottomOtherArea'>

      <div className='infoAreas2'>
        <div className='infoSheets2' id='companyBox'>
          <span className='infoSVG2'><img src='/svg_machine.svg' alt='Machine and Construction icon'/></span>
          <span className='infoTitle2'>Mašīnas, būvniecība</span>
          <div className='infoText2'>
            <span>Būvmateriāli</span>
            <span>Santehnika</span>
            <span>Dārza tehnika</span>
            <span>Pārvadāšana un iekraušana</span>
            <span>Ģeneratori</span>
            <span>Mazgāšanas aprīkojums</span>
            <span>Mērinstrumenti</span>
            <span>Mazgāšanas aprīkojums</span>
            <span>Un vēl...</span>
          </div>
        </div>
        <div className='infoSheets2' id='companyBox2'>
          <span className='infoSVG2'><img src='/svg_laptop.svg' alt='Instruments and Electronics icon'/></span>
          <span className='infoTitle2'>Instrumenti, elektronika</span>
          <span className='infoText2'>
            <span>Būvmateriāli</span>
            <span>Santehnika</span>
            <span>Dārza tehnika</span>
            <span>Pārvadāšana un iekraušana</span>
            <span>Ģeneratori</span>
            <span>Mazgāšanas aprīkojums</span>
            <span>Mērinstrumenti</span>
            <span>Mazgāšanas aprīkojums</span>
            <span>Un vēl...</span>
          </span>
        </div>
        <div className='infoSheets2' id='companyBox3' onClick={ () => navigate("/sirket-firma-kurulus")}>
          <span className='infoSVG2'><img src='/svg_car2.svg' alt='Car icon'/></span>
          <span className='infoTitle2'>Transportlīdzekļi</span>
          <span className='infoText2'>
            <span>Būvmateriāli</span>
            <span>Santehnika</span>
            <span>Dārza tehnika</span>
            <span>Pārvadāšana un iekraušana</span>
            <span>Ģeneratori</span>
            <span>Mazgāšanas aprīkojums</span>
            <span>Mērinstrumenti</span>
            <span>Mazgāšanas aprīkojums</span>
            <span>Un vēl...</span>
          </span>
        </div>
      </div>

      <div className='infoAreas2'>
        <div className='infoSheets2' id='companyBox2'>
          <span className='infoSVG2'><img src='/svg_dress.svg' alt='Dress and shoes icon'/></span>
          <span className='infoTitle2'>Apģērbi, apavi</span>
          <span className='infoText2'>
            <span>Būvmateriāli</span>
            <span>Santehnika</span>
            <span>Dārza tehnika</span>
            <span>Pārvadāšana un iekraušana</span>
            <span>Ģeneratori</span>
            <span>Mazgāšanas aprīkojums</span>
            <span>Mērinstrumenti</span>
            <span>Mazgāšanas aprīkojums</span>
            <span>Un vēl...</span>
          </span>
        </div>
        <div className='infoSheets2' id='companyBox'>
          <span className='infoSVG2'><img src='/svg_baby.svg' alt='Baby icon'/></span>
          <span className='infoTitle2'>Bērni</span>
          <span className='infoText2'>
            <span>Būvmateriāli</span>
            <span>Santehnika</span>
            <span>Dārza tehnika</span>
            <span>Pārvadāšana un iekraušana</span>
            <span>Ģeneratori</span>
            <span>Mazgāšanas aprīkojums</span>
            <span>Mērinstrumenti</span>
            <span>Mazgāšanas aprīkojums</span>
            <span>Un vēl...</span>
          </span>
        </div>
        <div className='infoSheets2' id='companyBox2'>
          <span className='infoSVG2'><img src='/svg_home.svg' alt='Home and Hobbies icon'/></span>
          <span className='infoTitle2'>Māja, hobijs</span>
          <span className='infoText2'>
            <span>Būvmateriāli</span>
            <span>Santehnika</span>
            <span>Dārza tehnika</span>
            <span>Pārvadāšana un iekraušana</span>
            <span>Ģeneratori</span>
            <span>Mazgāšanas aprīkojums</span>
            <span>Mērinstrumenti</span>
            <span>Mazgāšanas aprīkojums</span>
            <span>Un vēl...</span>
          </span>
        </div>
      </div>

      <div> <br/><br/><br/><br/><br/></div>
      <div className='footerArea'> <Footer /> </div>
      
    </div>
  )
}

export default BottomHome