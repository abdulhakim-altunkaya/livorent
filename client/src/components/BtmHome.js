import {useNavigate} from "react-router-dom";
import Footer from './Footer'; 
import "../styles/bottomOther.css"

function BottomHome() {
  
  const navigate = useNavigate();

  return (
    <div className='bottomOtherArea'>

      <div className='infoAreas2'>
        <div className='infoSheets2' id='companyBox' >
          <span className='infoSVG2' onClick={() => navigate("/machines-construction")}>
            <img src='/svg_machine.svg' alt='Machine and Construction icon'/></span>
          <span className='infoTitle2' onClick={() => navigate("/machines-construction")}>Mašīnas, būvniecība</span>
          <div className='infoText2'>
            <span onClick={() => navigate("/section/11")}>Masti, torņi, konstrukcijas</span>
            <span onClick={() => navigate("/section/12")}>Santehnika</span>
            <span onClick={() => navigate("/section/13")}>Kompresori</span>
            <span onClick={() => navigate("/section/14")}>Pārvadāšana un iekraušana</span>
            <span onClick={() => navigate("/section/15")}>Ģeneratori</span>
            <span onClick={() => navigate("/section/16")}>Mērinstrumenti</span>
            <span onClick={() => navigate("/section/17")}>Mazgāšanas aprīkojums</span>
            <span onClick={() => navigate("/section/18")}>Un vēl...</span>
          </div>
        </div>
        <div className='infoSheets2' id='companyBox2' >
          <span className='infoSVG2' onClick={() => navigate("/electronics-instruments")}>
            <img src='/svg_laptop.svg' alt='Instruments and Electronics icon'/></span>
          <span className='infoTitle2' onClick={() => navigate("/electronics-instruments")}>Instrumenti, elektronika</span>
          <span className='infoText2'>
            <span onClick={() => navigate("/section/21")}>Telefoni</span>
            <span onClick={() => navigate("/section/22")}>Datori</span>
            <span onClick={() => navigate("/section/23")}>Virtuves tehnika</span>
            <span onClick={() => navigate("/section/24")}>Biroja tehnika</span>
            <span onClick={() => navigate("/section/25")}>Baterijas, Akumulatori</span>
            <span onClick={() => navigate("/section/26")}>Apgaismojums, Televizori</span>
            <span onClick={() => navigate("/section/27")}>Foto un optika</span>
            <span onClick={() => navigate("/section/28")}>Dārza tehnika</span>
            <span onClick={() => navigate("/section/29")}>Un vēl...</span>
          </span>
        </div>
        <div className='infoSheets2' id='companyBox3' >
          <span className='infoSVG2' onClick={ () => navigate("/vehicles")}>
            <img src='/svg_car2.svg' alt='Car icon'/></span>
          <span className='infoTitle2' onClick={ () => navigate("/vehicles")}>Transportlīdzekļi</span>
          <span className='infoText2'>
            <span onClick={() => navigate("/section/31")}>Vieglie auto</span>
            <span onClick={() => navigate("/section/32")}>Velosipēdi, skūteri</span>
            <span onClick={() => navigate("/section/33")}>Kravas automašīnas</span>
            <span onClick={() => navigate("/section/34")}>Traktori</span>
            <span onClick={() => navigate("/section/35")}>Lauksaimniecības mašīnas</span>
            <span onClick={() => navigate("/section/36")}>Piekabes</span>
            <span onClick={() => navigate("/section/37")}>Jumta kastes</span>
            <span onClick={() => navigate("/section/38")}>Ūdens transports</span>
            <span onClick={() => navigate("/section/39")}>Un vēl...</span>
          </span>
        </div>
      </div>

      <div className='infoAreas2'>
        <div className='infoSheets2' id='companyBox2' >
          <span className='infoSVG2' onClick={() => navigate("/clothes")}>
            <img src='/svg_dress.svg' alt='Dress and shoes icon'/></span>
          <span className='infoTitle2' onClick={() => navigate("/clothes")}>Apģērbi, apavi</span>
          <span className='infoText2'>
            <span onClick={() => navigate("/section/41")}>Sieviešu apģērbi</span>
            <span onClick={() => navigate("/section/42")}>Vīriešu apģērbi</span>
            <span onClick={() => navigate("/section/43")}>Sieviešu apavi</span>
            <span onClick={() => navigate("/section/44")}>Vīriešu apavi</span>
            <span onClick={() => navigate("/section/45")}>Aksesuāri</span>
            <span onClick={() => navigate("/section/46")}>Sieviešu somiņas</span>
            <span onClick={() => navigate("/section/47")}>Mugursomas un Čemodāni</span>
            <span onClick={() => navigate("/section/48")}>Un vēl...</span>
          </span>
        </div>
        <div className='infoSheets2' id='companyBox'>
          <span className='infoSVG2' onClick={() => navigate("/hobbies")}>
            <img src='/svg_camping.svg' alt='Hobby icon'/></span>
          <span className='infoTitle2' onClick={() => navigate("/hobbies")}>Hobijs</span>
          <span className='infoText2'>
            <span onClick={() => navigate("/section/51")}>Sporta aprīkojums</span>
            <span onClick={() => navigate("/section/52")}>Medības, kempings</span>
            <span onClick={() => navigate("/section/53")}>Mūzikas instrumenti</span>
            <span onClick={() => navigate("/section/54")}>Slidošana</span>
            <span onClick={() => navigate("/section/55")}>Rokdarbi</span>            
            <span onClick={() => navigate("/section/56")}>Un vēl...</span>
          </span>
        </div>
        <div className='infoSheets2' id='companyBox2' >
          <span className='infoSVG2' onClick={() => navigate("/event-organization")}>
            <img src='/svg_event.svg' alt='Event organization icon'/></span>
          <span className='infoTitle2' onClick={() => navigate("/event-organization")}>Pasākumi</span>
          <span className='infoText2'>
            <span onClick={() => navigate("/section/61")}>Dekorācijas</span>
            <span onClick={() => navigate("/section/62")}>Dzīvnieki</span>
            <span onClick={() => navigate("/section/63")}>Mēbeles un Paklāji</span>
            <span onClick={() => navigate("/section/64")}>Inventārs aktīvai atpūtai</span>
            <span onClick={() => navigate("/section/65")}>Atrakciju noma</span>
            <span onClick={() => navigate("/section/66")}>Trauki, galda rīki</span>
            <span onClick={() => navigate("/section/67")}>Kostīmi</span>
            <span onClick={() => navigate("/section/68")}>Pirtis</span>
            <span onClick={() => navigate("/section/69")}>Un vēl...</span>
          </span>
        </div>
      </div>

      <div> <br/><br/><br/><br/><br/></div>
      <Footer />
    </div>
  )
}

export default BottomHome