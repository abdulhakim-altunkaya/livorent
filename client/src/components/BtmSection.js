import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from "react-router-dom";
import "../styles/BtmSection.css"
import "../styles/tableMain.css";
import Footer from "./Footer.js";
import { useNavigate } from 'react-router-dom';
import { detectSection, detectCategory } from './utilsCategories';

function BtmSection() {
  const navigate = useNavigate();
  const { sectionNumber } = useParams();

  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [errorFrontend, setErrorFrontend] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state
  //states for returning back main category or section pages
  const [mainCategoryNum, setMainCategoryNum] = useState(0);
  const [titleMainCategory, setTitleMainCategory] = useState("");

    useEffect(() => {
    const getData = async () => {
      try {
          const response = await axios.get(`http://localhost:5000/api/get/adsbysubsection/${sectionNumber}`);
          const data = response.data;

          if (data.resStatus && Array.isArray(data.resData)) {
            if (data.resData.length === 0) {
              setErrorFrontend("Šajā kategorijā nav sludinājumu.");
            } else {
              setMessage(data.resData);  // This is your actual ads array
            }
          } else {
            // Handle unexpected empty or malformed data
            setErrorFrontend("Neizdevās ielādēt sludinājumus.");
            console.log("Backend returned unexpected structure:", data);
          }
        } catch (error) {
          if (error.response && error.response.data) {
            const backendError = error.response.data;
            if (backendError.resErrorCode === 1) {
              setErrorFrontend("Kļūda: kategorija nav norādīta.");
            } else if (backendError.resErrorCode === 2) {
              setErrorFrontend("Kļūda: datu bāzes savienojuma problēma.");
            } else {
              setErrorFrontend("Nezināma servera kļūda.");
            }
            console.log("Backend error:", backendError.resMessage);
          } else {
            setErrorFrontend("Kļūda: neizdevās izveidot savienojumu ar serveri.");
            console.log("Network error:", error.message);
          }
        } finally {
          setLoading(false);
        }
      };
    getData();
  }, [sectionNumber]);

  //get title data from utilsCategories js file
  const sectionNum2 = Number(sectionNumber); // Convert to number
  const titleSection = detectSection(sectionNum2);

  useEffect(() => {
    if (!sectionNumber || Number(sectionNumber) > 99 || Number(sectionNumber) < 10) {
      setErrorFrontend("Kļūda: sludinājumus nevarēja ielādēt");
    }
    const firstDigit = parseInt(sectionNumber[0]); // Get first digit
    const secondDigit = parseInt(sectionNumber[1]); // Get second digit
    setMainCategoryNum(firstDigit);

    setTitleMainCategory(detectCategory(firstDigit));
  }, [sectionNumber]);

    //Also, back navigation links to return to main category or section pages
  const goMain = () => {
    if (mainCategoryNum === 1) {
      navigate("/machines-construction")
    } else if(mainCategoryNum === 2) {
      navigate("electronics-instruments")
    } else if(mainCategoryNum === 3) {
      navigate("/vehicles")
    } else if(mainCategoryNum === 4) {
      navigate("/clothes")
    } else if(mainCategoryNum === 5) {
      navigate("/hobbies")
    } else if(mainCategoryNum === 6) {
      navigate("/event-organization")
    } else {
      return;
    }
  }
  const goSection = () => { 
    navigate(`/section/${sectionNumber}`)
  }

  return (
    <div>
      <div className='sectionTitleArea'>
          <h3>{titleSection}</h3>
          <span className='sectionCategoryLinks' onClick={goMain}>{titleMainCategory}</span>
          &nbsp;&nbsp;/&nbsp;&nbsp;
          <span className='sectionCategoryLinks' onClick={goSection}>{titleSection}</span>
          <br/><br/><br/>
      </div>
      <div>
        { loading ? 
            <div aria-live="polite">Ielādē...</div> 
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
                        <th className='column5' scope="col">Datums</th>
                      </tr>
                    </thead> 
                    <tbody>
                      {message.map(record => (
                        <tr key={record.id} className='tableRows'>
                          <td onClick={() => navigate(`/item/${record.id}`)} className='imgContainerTd'>
                            <img src={record.image_url[0]} alt='small pic of advertisement'/>
                          </td>
                          <td onClick={() => navigate(`/item/${record.id}`)} className='cell2'>
                            {record.title.length > 60 ? `${record.title.substring(0, 60)}...` : record.title}
                          </td>
                          <td onClick={() => navigate(`/item/${record.id}`)} className='cell3'>
                            {record.description.length > 200 ? `${record.description.substring(0, 200)}...` : record.description}
                          </td>
                          <td onClick={() => navigate(`/item/${record.id}`)} className='cell4'>{record.price}</td>
                          <td onClick={() => navigate(`/item/${record.id}`)} className='cell5'>{record.city}</td>
                          <td onClick={() => navigate(`/item/${record.id}`)} className='cell6'>{record.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </>
              ) : (
                <p>Dati nav pieejami</p> // Handle case where message is null or empty
              )}
            </>
        }
      </div>
      <br/><br/><br/><br/><br/><br/>
      <br/><br/><br/><br/><br/><br/>
      <div className='FooterContainer'>
        <Footer />
      </div>
      
    </div>
  )
}

export default BtmSection;


