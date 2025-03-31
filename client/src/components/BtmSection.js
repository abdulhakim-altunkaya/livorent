import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from "react-router-dom";
import "../styles/BtmSection.css"
import "../styles/tableMain.css";
import Footer from "./Footer.js";
import { useNavigate } from 'react-router-dom';
import { detectSection } from './utilsCategories';

function BtmSection() {
  const navigate = useNavigate();
  const { sectionNumber } = useParams();

  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [errorFrontend, setErrorFrontend] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state

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

  //get title data from utilsCategories js file
  const sectionNum2 = Number(sectionNumber); // Convert to number
  const titleSection = detectSection(sectionNum2);

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
                          <tr key={record.id} className='tableRows'>
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


