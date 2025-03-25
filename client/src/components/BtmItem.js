import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from "react-router-dom";
import "../styles/Item.css"
import Footer from "./Footer.js";

function BtmItem() {
  const { itemNumber } = useParams();
  const [message, setMessage] = useState(null);
  const [errorFrontend, setErrorFrontend] = useState(null);
  const [loading, setLoading] = useState(true);
  const [displayedImage, setDisplayedImage] = useState(0);
  const [imagesLength, setImagesLength] = useState(0);
  //The states below are for fullscreen image viewing
  const [showFullPhone, setShowFullPhone] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [images, setImages] = useState([]); // Added to store limited images

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
      const limitedImages = message.image_url.slice(0, 10);
      setImages(limitedImages);
      setImagesLength(limitedImages.length);
    }
  }, [message]);

  const changeImageLeft = () => {
    if (displayedImage === 0) {
      setDisplayedImage(imagesLength-1)
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
  //Fullscreen image function 1
  const handleImageClick = () => {
    if (message?.image_url?.[displayedImage]) {
      setIsImageExpanded(true);
    }
  };
  //Fullscreen image function 2
  const closeExpandedImage = () => {
    setIsImageExpanded(false);
  };

  const renderDots = () => {
    return (
      <div className="dotsContainer">
        {images.map((_, index) => (
          <span 
            key={index}
            className={`dot ${index === displayedImage ? 'active' : ''}`}
            onClick={() => setDisplayedImage(index)}
          />
        ))}
      </div>
    );
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Not provided';
    
    if (showFullPhone) {
      return phone;
    } else {
      return `${phone.slice(0, 3)}${'*'.repeat(phone.length - 3)}`;
    }
  };

  //We dont need to display all the name, just name and if there is surname, the first letter of it.
  const formatName = (name) => {
    if (!name) return 'Not provided';
    
    const names = name.trim().split(/\s+/);
    if (names.length === 1) return name;
    
    return `${names[0]} ${names[names.length - 1].charAt(0)}.`;
  };

  return ( 
    <div>
      <div className='itemMainContainer'>
        { loading ? 
            <div aria-live="polite">Loading...</div> 
          : errorFrontend ? (
            <p className='errorFieldItem'>{errorFrontend}</p>
          ) :
            <>
              {message ? (
                <>
                  <div className='carouselArea'>
                    {imagesLength > 1 && (
                      <div className='itemArrows' onClick={changeImageLeft}>
                        <img src='/svg_arrow_left.svg' alt='Go to left'/>
                      </div>
                    )}
                    <div className='itemImagesArea'>
                      <span className='itemImageContainer'>
                        <img 
                          src={message.image_url[displayedImage]} 
                          alt='small pic of advertisement'
                          onClick={handleImageClick}
                          style={{ cursor: 'pointer' }}
                        />
                      </span>
                      <span>{imagesLength > 1 && renderDots()}</span> 
                    </div>
                    {imagesLength > 1 && (
                      <div className='itemArrows' onClick={changeImageRight}>
                        <img src='/svg_arrow_right.svg' alt='Go to right'/>
                      </div>
                    )}
                  </div>
                  {/*Below is the code for fullscreen image viewwing only */}
                  {isImageExpanded && (
                    <div className="imageModal" onClick={closeExpandedImage}>
                      <div className="modalContent">
                        <img 
                          src={message.image_url[displayedImage]} 
                          alt="Expanded view" 
                          onClick={e => e.stopPropagation()}
                        />
                        <button className="closeButton" onClick={closeExpandedImage}>
                          &times;
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className='itemDetailsArea'><h2>Title: {itemNumber}</h2> </div>
                  <div className='itemDetailsArea'>Description: {message.description}</div>
                  <div className='itemDetailsArea otherDetailsArea'>
                    <div><span className='grayText'>Pilsēta, pagasts vai rajons:</span><span>    {message.city}</span></div>
                    <div><span className='grayText'>Cena:</span><span>    {message.price}</span></div>
                    <div><span className='grayText'>Vārds:</span><span>    {formatName(message?.name)}</span></div>
                    <div>
                      <span className='grayText'>Telefons:    </span>
                      <span className='phoneNumber' onClick={() => setShowFullPhone(!showFullPhone)}>
                        {formatPhoneNumber(message?.telephone)}</span>
                    </div>
                  
                  </div>
                </>
              ) : (
                <p>No data available</p>
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

export default BtmItem;