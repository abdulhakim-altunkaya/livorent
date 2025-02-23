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
          <span className='infoSVG2'><img src='/svg_translation.svg' alt='Translation icon'/></span>
          <span className='infoTitle2'>Drēbes, apavi</span>
          <span className='infoText2'>Alanında tecrübeli Letonya'da yaşayan tercümanlarımız 
            gerek yazılı gerek sözlü Letonca-Rusça-Türkçe-İngilizce dillerinde çeviri hizmetleri sunmaktadırlar.
            Letonya'daki tercümanlarımız aynı zamanda Konsolosluk ve Noterliklere de yeminli tercüman olarak
            hizmet etmektedirler. 
          </span>
        </div>
        <div className='infoSheets2' id='companyBox2'>
          <span className='infoSVG2'><img src='/svg_tourist.svg' alt='Tourist icon'/></span>
          <span className='infoTitle2'>Mājai</span>
          <span className='infoText2'>İşadamı ve bürokrat heyetlerimiz, turistik kafileler ve vatandaşlarımıza Letonya'ya 
            yapacakları seyahat boyunca tecrübeli ve dil bilen rehberlerimiz hizmet etmektedir. Rehberlerimiz 
            Letonya, Estonya, Litvanya, Baltıklar ve İskandinav ülkelerinde görev alabilmektedir.  
          </span>
        </div>
        <div className='infoSheets2' id='companyBox3' onClick={ () => navigate("/sirket-firma-kurulus")}>
          <span className='infoSVG2'><img src='/svg_company.svg' alt='Company icon'/></span>
          <span className='infoTitle2'>Iekārta</span>
          <span className='infoText2'>Letonya'da şirket kurmak isteyen vatandaşlarımıza bu alanda oldukça tecrübeli personelimiz
            hizmet sunmakta olup, detaylı bilgi için tıklayabilirsiniz.
          </span>
        </div>
      </div>

      <div className='infoAreas2'>
        <div className='infoSheets2' id='companyBox2'>
          <span className='infoSVG2'><img src='/svg_agriculture.svg' alt='Agriculture icon'/></span>
          <span className='infoTitle2'>Lauksaimniecība</span>
          <span className='infoText2'>Şirketinizin ihtiyaç duyacağı banka hesabı açma, muhasebe hizmetleri, insan kaynakları, 
            ihalelere katılım, ticari alan kiralama, reklam, pazar araştırması ve diğer teknik konularda 
            detaylı hizmetler sunmaktayız.
          </span>
        </div>
        <div className='infoSheets2' id='companyBox'>
          <span className='infoSVG2'><img src='/svg_hobby.svg' alt='Hobby icon'/></span>
          <span className='infoTitle2'>Atpūta, hobiji</span>
          <span className='infoText2'>Şirketlerimiz ve vatandaşlarımızın Letonya'da ihtiyaç duyacakları Konsolosluk,
            Noterlik belge onayları, apostil işlemleri, randevu takipleri, yabancı kurumların aranması gibi konularda 
            dil bilen personelimiz ile hizmet sunmaktayız.
          </span>
        </div>
        <div className='infoSheets2' id='companyBox2'>
          <span className='infoSVG2'><img src='/svg_customs1.svg' alt='Customs, tax, accounting icon'/></span>
          <span className='infoTitle2'>Gümrük, Vergi</span>
          <span className='infoText2'>Letonya gümrüklerinden mal çekme ve vergi işlemleri konularında uzmanlarımızla 
            kurumsal hizmetler sunmaktayız.
          </span>
        </div>
      </div>

      <div> <br/><br/><br/><br/><br/></div>
      <div className='footerArea'> <Footer /> </div>
      
    </div>
  )
}

export default BottomHome