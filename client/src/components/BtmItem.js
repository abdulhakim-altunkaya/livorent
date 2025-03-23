import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from "react-router-dom";
import "../styles/Item.css"
import Footer from "./Footer.js";


function BtmItem() {
  const { itemNumber } = useParams();
  const [message, setMessage] = useState(null); // Initialize with null to better handle initial state
  const [errorFrontend, setErrorFrontend] = useState(null); // Add error state
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get/item/${itemNumber}`);
        setMessage(response.data);
      } catch (error) {
        setErrorFrontend("Error: item details could not be fetched");
        console.log(error.message)
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [itemNumber]);

  return ( 
    <div>
      <div className='itemMainContainer'>




        { loading ? 
            <div aria-live="polite">Loading...</div> 
          : errorFrontend ? ( // Check for error first
            <p className='errorFieldItem'>{errorFrontend}</p>
          ) :
            <>
              {message ? (
                <>
                  <div>Title: {itemNumber}</div>
                  <div>Carousel</div>
                  <div>Description: {message.description}</div>
                  <div>Price: {message.price}</div>
                  <div> <span>Name: {message.name}</span> <span>Telephone: {message.telephone}</span> </div>
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

export default BtmItem