import React from 'react';
import {useNavigate} from "react-router-dom";
import Footer from './Footer'; 
import "../styles/bottomOther.css"

function BottomHome() {
  
  const navigate = useNavigate();

  return (
    <div className='bottomOtherArea'>

      <div className='infoAreas2'>
        <div className='infoSheets2' id='companyBox' onClick={() => navigate("/machines-construction")}>
          <span className='infoSVG2'><img src='/svg_machine.svg' alt='Machine and Construction icon'/></span>
          <span className='infoTitle2'>Mašīnas, būvniecība</span>
          <div className='infoText2'>
            <span>Masti, torņi, konstrukcijas</span>
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
        <div className='infoSheets2' id='companyBox2' onClick={() => navigate("/electronics-instruments")}>
          <span className='infoSVG2'><img src='/svg_laptop.svg' alt='Instruments and Electronics icon'/></span>
          <span className='infoTitle2'>Instrumenti, elektronika</span>
          <span className='infoText2'>
            <span>Telefoni</span>
            <span>Datori</span>
            <span>Virtuves tehnika</span>
            <span>Biroja tehnika</span>
            <span>Baterijas, Akumulatori</span>
            <span>Apgaismojums, Televizori</span>
            <span>Foto un optika</span>
            <span>Dārza tehnika</span>
            <span>Un vēl...</span>
          </span>
        </div>
        <div className='infoSheets2' id='companyBox3' onClick={ () => navigate("/vehicles")}>
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
        <div className='infoSheets2' id='companyBox2' onClick={() => navigate("/clothes")}>
          <span className='infoSVG2'><img src='/svg_dress.svg' alt='Dress and shoes icon'/></span>
          <span className='infoTitle2'>Apģērbi, apavi</span>
          <span className='infoText2'>
            <span>Sieviešu apģērbi</span>
            <span>Vīriešu apģērbi</span>
            <span>Sieviešu apavi</span>
            <span>Vīriešu apavi</span>
            <span>Aksesuāri</span>
            <span>Sieviešu somiņas</span>
            <span>Mugursomas un Čemodāni</span>
            <span>Un vēl...</span>
          </span>
        </div>
        <div className='infoSheets2' id='companyBox' onClick={() => navigate("/hobbies")}>
          <span className='infoSVG2'><img src='/svg_camping.svg' alt='Hobby icon'/></span>
          <span className='infoTitle2'>Hobijs</span>
          <span className='infoText2'>
            <span>Sporta aprīkojums</span>
            <span>Medības, kempings</span>
            <span>Mūzikas instrumenti</span>
            <span>Slidošana</span>
            <span>Rokdarbi</span>            
            <span>Un vēl...</span>
          </span>
        </div>
        <div className='infoSheets2' id='companyBox2' onClick={() => navigate("/event-organization")}>
          <span className='infoSVG2'><img src='/svg_event.svg' alt='Event organization icon'/></span>
          <span className='infoTitle2'>Pasākumi</span>
          <span className='infoText2'>
            <span>Dekorācijas</span>
            <span>Dzīvnieki</span>
            <span>Mēbeles un Paklāji</span>
            <span>Inventārs aktīvai atpūtai</span>
            <span>Atrakciju noma</span>
            <span>Trauki, galda rīki</span>
            <span>Kostīmi</span>
            <span>Pirtis</span>
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