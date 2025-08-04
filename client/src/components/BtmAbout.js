import "../styles/About.css"; 
import Footer from "./Footer";
function BtmAbout() {
  return (
    <>
      <div className='aboutArea'>
          <div className="leftSideAbout">
                <div className="titleAbout">
                  <h1>Livorent – Latvijas nomas platforma</h1>
                </div>
                <div className="descriptionAbout">
                  <p> Livorent ir daudznozaru nomas platforma, kas savieno cilvēkus ar tehniku, 
                      transportlīdzekļiem, instrumentiem, apģērbiem un pasākumu organizēšanas 
                      precēm — viss vienuviet. Piedāvā vai iznomā mašīnas, elektroniku, velosipēdus, 
                      kleitas, teltis, ģeneratorus, pat kostīmus un slidas. Livorent padara nomu 
                      vienkāršu, ātru un drošu – Latvijā un tuvākajā apkārtnē.</p>  
                  <h4>Ieguldījumu iespējas</h4>
                  <p>Ja jūs interesē iespēja kļūt par stratēģisku investoru Livorent platformā, mēs 
                      esam atvērti sarunām ar partneriem, kuri dalās mūsu redzējumā un saskata 
                      ilgtermiņa potenciālu šajā projektā. </p>
                  <h4>Reklāmas partnerības</h4>
                  <p>Uzņēmumiem, kuri vēlas sasniegt mērķtiecīgu un iesaistītu auditoriju, 
                      Livorent piedāvā reklāmas iespējas dažādās kategorijās.</p>
                  <h4>Datu aizsardzība</h4>
                  <p>Jūsu privātums mums ir svarīgs. Mēs neizpaužam jūsu personas datus trešajām pusēm, 
                      un visi sludinājumi tiek automātiski dzēsti ik pēc 6 mēnešiem, lai nodrošinātu 
                      datu aktualitāti un minimālu glabāšanas laiku.</p>
                  <h4>Tory Software Solutions</h4>
                  <p>Tory Software Solutions, dibināts 2025. gadā Rīgā, Latvijā, izstrādā un pārvalda 
                      dažādus tiešsaistes projektus dažādās nozarēs, tostarp Livorent platformu.</p>
                </div>
                
          </div>
          <div className="rightSideAbout">
            <div>
              <img src='/svg_about_euro.svg' alt='free advertisements'/>
              &nbsp;&nbsp;
              <span>Bezmaksas sludinājumi</span>
            </div>
            <div>
              <img src='/svg_about_euro2.svg' alt='free registration'/>
              &nbsp;&nbsp;
              <span>Bezmaksas reģistrācija</span>
            </div>
            <div>
              <img src='/svg_about_data_protection.svg' alt='data protection'/>
              &nbsp;&nbsp;
              <span>Datu aizsardzība</span>
            </div>
            <div>
              <img src='/svg_about_sharing.svg' alt='from person to person'/>
              &nbsp;&nbsp;
              <span>No personas uz personu</span>
            </div>
          </div>
          

      </div>
      <br /><br /><br /><br /><br /><br /><br /><br />
      <Footer />
    </>
  )
}

export default BtmAbout;