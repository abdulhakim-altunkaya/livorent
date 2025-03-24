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
  const [displayedImage, setDisplayedImage] = useState(0);
  const [imagesLength, setImagesLength] = useState(0);

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

  useEffect(() => {
    if (message && message.image_url) {
      //max number of images to be displayed is 10
      const limitedImages = message.image_url.slice(0, 10);
      setImagesLength(limitedImages.length);
    }
  }, [message]);

  const changeImageLeft = () => {
    if (displayedImage === 0) {
      setDisplayedImage(imagesLength)
    } else {
      setDisplayedImage(displayedImage-1)
    }
  }

  const changeImageRight = () => {
    if (displayedImage === imagesLength-1) {
      setDisplayedImage(0)
    } else {
      setDisplayedImage(displayedImage+1)
    }
  }

  // Render dots indicator
  const renderDots = () => {
    return (
      <div className="dotsContainer">
        {message.image_url.map((_, index) => (
          <span 
            key={index}
            className={`dot ${index === displayedImage ? 'active' : ''}`}
            onClick={() => setDisplayedImage(index)}
          />
        ))}
      </div>
    );
  };

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

                  <div className='carouselArea'>

                    {imagesLength > 1 && ( // Only show arrows if more than 1 image
                      <div className='itemArrows' onClick={changeImageLeft}>
                        <img src='/svg_arrow_left.svg' alt='Go to left'/>
                      </div>
                    )}
                    <div className='itemImagesArea'>
                      <span><img src={message.image_url[displayedImage]} alt='small pic of advertisement'/></span>
                      <span>{imagesLength > 1 && renderDots()} {/* Only show dots if multiple images */}</span> 
                    </div>
                    {imagesLength > 1 && ( // Only show arrows if more than 1 image
                      <div className='itemArrows' onClick={changeImageRight}>
                        <img src='/svg_arrow_right.svg' alt='Go to right'/>
                      </div>
                    )}
                  </div>

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