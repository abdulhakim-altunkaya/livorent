//Add a point system for each seller
//Make sure only logged in users can leave a like
//improve isLikeAllowed logic

import { useState, useEffect } from 'react'; 
import axios from 'axios';
import "../styles/Profile.css";
import Footer from "./Footer.js";
import ReviewDisplay from "./ReviewDisplay.js";
import BtmLikeSeller from "./BtmLikeSeller.js";
import { useParams, useNavigate } from "react-router-dom";
import useUserStore from '../store/userStore';
import BtmVisitor from './BtmVisitor.js';

function BtmSeller() {
  const navigate = useNavigate()
  //we will check zustand store to see if there is any user data in it. If there is
  //then no need to make repetitive requests to backend and database about user information
  const { cachedSellerData } = useUserStore.getState(); 

  const { sellerNumber } = useParams();
  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [sellerData, setSellerData] = useState(null);
  const [errorFrontend, setErrorFrontend] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state

  const [rating, setRating] = useState(null);
  const [raters, setRaters] = useState(null);
  const [visitorsSeller, setVisitorsSeller] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get/adsbyuser/${sellerNumber}`);
        setMessage(response.data);     
        //sometimes the visitor might want to visit the same seller over and over again. 
        //To help backend receive less api calls, we can save the visited seller info in Zustand
        //Thus, if the visitor visits the same seller again, the seller info will come from Zustand not from DB.
        if (cachedSellerData?.id === sellerNumber) {
          setSellerData(cachedSellerData);
          console.log("cached data displayed");
        } else {
          const responseUser = await axios.get(`http://localhost:5000/api/get/userdata/${sellerNumber}`);
          setSellerData(responseUser.data);
          useUserStore.getState().setCachedSellerData(responseUser.data);
        } 
      } catch (error) {
        setErrorFrontend("Kļūda: Neizdevās ielādēt reklāmas.");
        console.log(error.message);
        setSellerData({}); // Ensure sellerData is never null
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [sellerNumber]);


  
  const handleRating = (num) => {
    setRating(num);
  };
  const handleRaters = (num) => {
    setRaters(num);
  }
  const handleVisitorsSeller = (num) => {
    setVisitorsSeller(num);
  }

  return (
    <div>
      <div>
        { loading ? 
            <div aria-live="polite">Ielādē...</div> 
          : errorFrontend ? ( // Check for error first
            <p className='errorFieldProfile'>{errorFrontend}</p> 
          ) :
            <>
                <div className='userInfoArea'>
                  <div>Name: <strong>{sellerData.name}</strong> </div>
                  <div>
                    {rating > 0 ?
                      <>Vērtējums: <strong><span className="ratingNum">{rating}</span></strong></>
                    :
                      <span className="raterParent">
                        <span>Vērtējums:<strong> 0 atsauksmju &nbsp;</strong></span>
                        <img src='/svg_smiling.svg' className='reviewSmilingIcon' alt='smiling face'/>
                      </span>
                    }
                    {raters > 0 ?
                      <span>&nbsp;({raters})</span>
                    :
                      <></>
                    }
                  </div>
                  <div >Skatījumu skaits: <strong>{visitorsSeller}</strong></div>
                  <div className='lastDivProfile'>Kopš: <strong>{sellerData.date}</strong></div>
                  <BtmLikeSeller sellerId={sellerNumber}  />
                </div>

              {message && message.length > 0  ? (
                <>
                  <div className='tableProfileArea'>
                    <table className='tableMainCategory'>
                      <thead> 
                        <tr>
                          <th className='columnProfile1' scope="col"></th>
                          <th className='columnProfile2' scope="col">Sludinājumi</th>
                          <th className='columnProfile3' scope="col">Informācija</th>
                          <th className='columnProfile4' scope="col">Cena</th>
                          <th className='columnProfile5' scope="col">Pilsēta</th>
                          <th className='columnProfile5' scope="col"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {message.map( record => (
                          <tr key={record.id} className='tableRowsProfile'>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='imgContainerCell'> 
                              <img className='adMainImage' src={record.image_url[0]} alt='a small pic of ad'/></td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cellProfile2'>
                              {record.title.length > 100 
                                ? `${record.title.substring(0, 100)}...` 
                                : record.title}
                            </td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cellProfile3'>
                              {record.description.length > 200 
                                ? `${record.description.substring(0, 200)}...` 
                                : record.description}
                            </td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cellProfile4'>{record.price}</td>
                            <td onClick={() => navigate(`/item/${record.id}`)} className='cellProfile5'>{record.city}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="noAdsMessage">
                  <p>Jums vēl nav sludinājumu</p> {/* "You don't have any ads yet" in Latvian */}
                </div>
              )}
            </>
        }
      </div>
      <br/><br/><br/><br/><br/><br/>
      <div> 
        <ReviewDisplay reviewReceiver={sellerNumber} 
        handleRating = {handleRating}
        handleRaters = {handleRaters} />
      </div>
      <br/><br/><br/><br/><br/><br/>
      <div className='FooterContainer'>
        <Footer />
      </div>
      <BtmVisitor sellerId={sellerNumber} handleVisitorsSeller={handleVisitorsSeller} />
    </div>
  )
}

export default BtmSeller;