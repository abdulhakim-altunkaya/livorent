import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from "react-router-dom";
import "../styles/BtmSection.css"
import "../styles/tableMain.css";
import Footer from "./Footer.js";
import { useNavigate } from 'react-router-dom';

function BtmSection() {
  const navigate = useNavigate();
  const { sectionNumber } = useParams();

  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [errorFrontend, setErrorFrontend] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state
  const [titleSection, setTitleSection] = useState("");

  useEffect(() => {
    const getData = async () => { 
      try {
        const response = await axios.get(`http://localhost:5000/api/get/adsbysubsection/${sectionNumber}`);
        setMessage(response.data);
      } catch (error) {
        setErrorFrontend("Error: ads could not be fetched");
        console.log(error.message)
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [sectionNumber]);

  useEffect(() => {
    //code for the title area
    const sectionTitles = {
      11: "Masti, torņi, konstrukcijas",
      12: "Santehnika",
      13: "Kompresori",
      14: "Pārvadāšana un iekraušana",
      15: "Ģeneratori",
      16: "Mērinstrumenti",
      17: "Mazgāšanas aprīkojums",
      18: "Citi",
      21: "Telefoni",
      22: "Datori",
      23: "Virtuves tehnika",
      24: "Biroja tehnika",
      25: "Baterijas, Akumulatori",
      26: "Apgaismojums, Televizori",
      27: "Foto un optika",
      28: "Dārza tehnika",
      29: "Citi",
      31: "Vieglie auto",
      32: "Velosipēdi, skūteri",
      33: "Kravas automašīnas",
      34: "Traktori",
      35: "Lauksaimniecības mašīnas",
      36: "Piekabes",
      37: "Jumta kastes",
      38: "Ūdens transports",
      39: "Citi",
      41: "Sieviešu apģērbi",
      42: "Vīriešu apģērbi",
      43: "Sieviešu apavi",
      44: "Vīriešu apavi",
      45: "Aksesuāri", 
      46: "Sieviešu somiņas",
      47: "Mugursomas un Čemodāni",
      48: "Citi",
      51: "Sporta aprīkojums",
      52: "Medības, kempings",
      53: "Mūzikas instrumenti",
      54: "Slidošana",
      55: "Rokdarbi",
      56: "Citi",
      61: "Dekorācijas",
      62: "Dzīvnieki",
      63: "Mēbeles un Paklāji",
      64: "Inventārs aktīvai atpūtai",
      65: "Atrakciju noma",
      66: "Trauki, galda rīki",
      67: "Kostīmi",
      68: "Pirtis",
      69: "Citi",
    };
    const sectionNum = Number(sectionNumber); // Convert to number

    if (sectionNum in sectionTitles) {
      setTitleSection(sectionTitles[sectionNum]);
    } else {
      setTitleSection("Unknown Section");
    }
  }, [sectionNumber]);

  return (
    <div>
      <div className='sectionTitleArea'><h3>{titleSection}</h3></div>
      <br/><br/><br/>
      <div>
        { loading ? 
            <div aria-live="polite">Loading...</div> 
          : errorFrontend ? ( // Check for error first
            <p className='errorFieldSection'>{errorFrontend}</p>
          ) :
            <>
              {message ? (
                <>
                
                  <div className='tableMainCategoryArea'>
                  
                    <table className='tableMainCategory'>
                      <thead>
                        <tr>
                          <th className='column1' scope="col"></th>
                          <th className='column2' scope="col">Sludinājumi</th>
                          <th className='column3' scope="col">Informācija</th>
                          <th className='column4' scope="col">Cena</th>
                          <th className='column5' scope="col">Pilsēta</th>
                        </tr>
                      </thead> 
                      <tbody>
                        {message.map( record => (
                          <tr key={record} className='tableRows'>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='imgContainerTd'>
                               <img src={record.image_url[0]} alt='small pic of advertisement'/>
                            </td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cell2'>{record.title}</td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cell3'>{record.description}</td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cell4'>{record.price}</td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cell5'>{record.city}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p>No data available</p> // Handle case where message is null or empty
              )}
            </>
        }
      </div>
      <br/><br/><br/><br/><br/><br/>
      <div className='FooterContainer'>
        <Footer />
      </div>
      
    </div>
  )
}

export default BtmSection;


