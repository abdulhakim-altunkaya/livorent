import React, {useState, useEffect} from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";//for getting search input through url query 
import Footer from "./Footer";
import "../styles/Search.css"; 
import "../styles/tableMain.css";

function BtmSearch() {

  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [errorFrontend, setErrorFrontend] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query");

  useEffect(() => {
    const getData = async () => {
      try {
        if (searchQuery === null || searchQuery.length < 3) {
          alert("Search word is missing or too short.")
          return;
        }
        const response = await axios.get(`http://localhost:5000/api/search`, {
          params: { myQuery: searchQuery } 
        });
        const { responseStatus, responseMessage, responseResult } = response.data;
        if (!responseStatus) {
          alert(responseMessage || "Meklēšana neizdevās.");
          setMessage([]);
          return;
        }
        setMessage(responseResult);
      } catch (error) {
        setErrorFrontend("Error: ads could not be fetched");
        console.log(error)
      } finally {
        setLoading(false);
      }
    }
    getData();
  }, [searchQuery])
  

  return (
    <div>
      <div className="searchDiv">
        <span>Meklēšanas rezultāti: </span><span className="targetWord">{searchQuery}</span>
      </div>

      <div>
        { loading ? 
            <div aria-live="polite">Loading...</div> 
          : errorFrontend ? ( // Check for error first
            <p className='errorFieldAdsMain'>{errorFrontend}</p>
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
                        {message.map(record => (
                          <tr key={record.id} className='tableRows'>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='imgContainerTd'>
                              <img src={record.image_url[0]} alt='small pic of advertisement'/>
                            </td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cell2'>
                              {record.title.length > 100 ? `${record.title.substring(0, 100)}...` : record.title}
                            </td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cell3'>
                              {record.description.length > 200 ? `${record.description.substring(0, 200)}...` : record.description}
                            </td>
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
      <br /><br /><br /><br /><br /><br /><br /><br />
      <Footer />
    </div>
  )
}

export default BtmSearch