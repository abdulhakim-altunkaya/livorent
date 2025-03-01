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
            <span>Kompresori</span>
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
            <span>Telefoni</span>
            <span>Datori</span>
            <span>Virtuves tehnika</span>
            <span>Orgtehnika</span>
            <span>Baterijas, Akumulatori</span>
            <span>Televizori</span>
            <span>Foto un optika</span>
            <span>Mūzikas instrumenti</span>
            <span>Un vēl...</span>
          </span>
        </div>
        <div className='infoSheets2' id='companyBox3' onClick={ () => navigate("/sirket-firma-kurulus")}>
          <span className='infoSVG2'><img src='/svg_car2.svg' alt='Car icon'/></span>
          <span className='infoTitle2'>Transportlīdzekļi</span>
          <span className='infoText2'>
            <span>Vieglie auto</span>
            <span>Velosipēdi, skūteri</span>
            <span>Kravas automašīnas</span>
            <span>Traktori</span>
            <span>Lauksaimniecības mašīnas</span>
            <span>Piekabes</span>
            <span>Jumta kastes</span>
            <span>Ūdens transports</span>
            <span>Un vēl...</span>
          </span>
        </div>
      </div>

      <div className='infoAreas2'>
        <div className='infoSheets2' id='companyBox2'>
          <span className='infoSVG2'><img src='/svg_dress.svg' alt='Dress and shoes icon'/></span>
          <span className='infoTitle2'>Apģērbi, apavi</span>
          <span className='infoText2'>
            <span>Sieviešu apģērbi</span>
            <span>Vīriešu apģērbi</span>
            <span>Sieviešu apavi</span>
            <span>Vīriešu apavi</span>
            <span>Aksesuāri</span>
            <span>Kostīmi</span>
            <span>Sieviešu somiņas</span>
            <span>Mugursomas un Čemodāni</span>
            <span>Un vēl...</span>
          </span>
        </div>
        <div className='infoSheets2' id='companyBox'>
          <span className='infoSVG2'><img src='/svg_baby.svg' alt='Baby icon'/></span>
          <span className='infoTitle2'>Bērni</span>
          <span className='infoText2'>
            <span>Meiteņu apģērbs</span>
            <span>Zēnu apģērbs</span>
            <span>Meiteņu apavi</span>
            <span>Zēnu apavi</span>
            <span>Aksesuāri</span>
            <span>Rati un ķengursomas</span>
            <span>Zīdaiņu gultas</span>
            <span>Rotaļlietas</span>
            <span>Un vēl...</span>
          </span>
        </div>
        <div className='infoSheets2' id='companyBox2'>
          <span className='infoSVG2'><img src='/svg_home.svg' alt='Home and Hobbies icon'/></span>
          <span className='infoTitle2'>Māja, hobijs</span>
          <span className='infoText2'>
            <span>Mēbeles</span>
            <span>Sadzīves tehnika</span>
            <span>Dārza tehnika</span>
            <span>Dārza mēbeles un aksesuāri</span>
            <span>Trauki, galda rīki</span>
            <span>Aizkari un Paklāji</span>
            <span>Sporta aprīkojums</span>
            <span>Medības, kempings</span>
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