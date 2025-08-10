import { useState, useEffect, useRef} from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Footer from "./Footer";
import "../styles/Search.css";
import "../styles/tableMain.css";

function BtmSearch() {
  const [message, setMessage] = useState(null);
  const [errorFrontend, setErrorFrontend] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query");
  const isSaving = useRef(false);  // flag to prevent repetitive requests and duplicates
 
  useEffect(() => {
    const getData = async () => {
      setMessage(null);
      setErrorFrontend(null);
      // prevent repetitive requests
      if (isSaving.current) return; 
      isSaving.current = true;
      try {
        if (!searchQuery || searchQuery.trim().length < 3) {
          alert("Meklēšanas vārds trūkst vai ir pārāk īss.");
          return;
        }

        const response = await axios.get("http://localhost:5000/api/search", {
          params: { myQuery: searchQuery }
        });

        const { responseStatus, responseMessage, responseResult } = response.data;

        if (responseStatus === false) {
          setErrorFrontend(responseMessage || "Meklēšana neizdevās.");
          setMessage([]);
          return;
        }

        setMessage(responseResult);
      } catch (error) {
        console.log(error);
        setErrorFrontend("Nav sludinājumu.");
      } finally {
        isSaving.current = false;
      }
    };

    getData();
  }, [searchQuery]);

  return ( 
    <div>
      <div className="searchDiv">
        <span>Meklēšanas rezultāti: </span>
        <span className="targetWord">{searchQuery}</span>
      </div>

      <div>
        {isSaving.current ? (
          <div aria-live="polite">Ielādē...</div>
        ) : errorFrontend ? (
          <p className="errorFieldAdsMain">{errorFrontend}</p>
        ) : message && message.length > 0 ? (
          <div>
            <div className="tableMainCategoryArea"> 
              <table className="tableMainCategory">
                <thead>
                  <tr>
                    <th className="column1" scope="col"></th>
                    <th className="column2" scope="col">Sludinājumi</th>
                    <th className="column3" scope="col">Informācija</th>
                    <th className="column4" scope="col">Cena</th>
                    <th className="column5" scope="col">Pilsēta</th>
                  </tr>
                </thead>
                <tbody>
                  {message.map((record) => (
                    <tr key={record.id} className="tableRows">
                      <td onClick={() => navigate(`/item/${record.id}`)} className="imgContainerTd">
                        <img src={record.image_url[0]} alt="small pic of advertisement" />
                      </td>
                      <td onClick={() => navigate(`/item/${record.id}`)} className="cell2">
                        {record.title.length > 100 ? `${record.title.substring(0, 100)}...` : record.title}
                      </td>
                      <td onClick={() => navigate(`/item/${record.id}`)} className="cell3">
                        {record.description.length > 200 ? `${record.description.substring(0, 200)}...` : record.description}
                      </td>
                      <td onClick={() => navigate(`/item/${record.id}`)} className="cell4">{record.price}</td>
                      <td onClick={() => navigate(`/item/${record.id}`)} className="cell5">{record.city}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="tableMainCategoryAreaSmall"> 
            <table className="tableMainCategory">
              <thead> 
                <tr>
                  <th className="column1" scope="col"></th>
                  <th className="column2" scope="col">Sludinājumi</th>
                  <th className="column3" scope="col">Informācija</th>
                </tr>
              </thead>
              <tbody>
                {message.map((record) => (
                  <tr key={record.id} className="tableRows">
                    <td onClick={() => navigate(`/item/${record.id}`)} className="imgContainerTd">
                      <img src={record.image_url[0]} alt="small pic of advertisement" />
                    </td>
                    <td onClick={() => navigate(`/item/${record.id}`)} className="cell2"> 
                      <strong>{record.title.length > 60 ? `${record.title.substring(0, 60)}...` : record.title}</strong> 
                      <br/>
                      <em>{record.description.length > 40 ? `${record.description.substring(0, 40)}...` : record.description}</em>
                    </td>
                    <td onClick={() => navigate(`/item/${record.id}`)} className="cell4">
                      {record.price} <br/><br/>
                      {record.city} <br/><br/>
                      {record.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          </div>
          
        ) : (
          <p className="errorFieldAdsMain">{errorFrontend}</p>
        )}
      </div>
      <br /><br /><br /><br /><br /><br /><br /><br />
      <br /><br /><br /><br /><br /><br /><br /><br />
      <Footer />
    </div>
  );
}

export default BtmSearch;
