import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Item.css";
import Footer from "./Footer.js";
import CommentDisplay from "./CommentDisplay.js"
import { detectSection, detectCategory } from './utilsCategories';
import BtmLikeItem from './BtmLikeItem.js'; 
import BtmVisitor from './BtmVisitor.js';

function BtmItem() {
  const navigate = useNavigate();

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
  const [titleMainCategory, setTitleMainCategory] = useState("");
  const [titleSection, setTitleSection] = useState("");
  //states for returning back main category or section pages
  const [mainCategoryNum, setMainCategoryNum] = useState(0);
  const [sectionNum, setSectionNum] = useState(0);
  //we need this to authenticate token on protected endpoints
  const token = localStorage.getItem("token_livorent");
  //visitors count set by the child BtmVisitor component
  const [visitorsItem, setVisitorsItem] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get/item/${itemNumber}`);
        setMessage(response.data.resData);
      } catch (error) {
        if (error.response?.data?.resErrorCode) {
          switch(error.response.data.resErrorCode) {
            case 1:
              setErrorFrontend("Kļūda: trūkst sludinājuma ID ❌");
              break;
            case 2:
              setErrorFrontend("Kļūda: datu bāzes kļūda ❌");
              break;
            default:
              setErrorFrontend("Kļūda: nezināma servera kļūda ❌");
          }
        } else {
          setErrorFrontend("Kļūda: neizdevās ielādēt sludinājuma informāciju ❌");
        }
        console.log(error.message);
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
    if (!phone) return 'Nav norādīts';
    
    if (showFullPhone) {
      return phone;
    } else {
      return `${phone.slice(0, 3)}${'*'.repeat(phone.length - 3)}`;
    }
  };

  //We dont need to display all the name, just name and if there is surname, the first letter of it.
  const formatName = (name) => {
    if (!name) return 'Nav norādīts';
    
    const names = name.trim().split(/\s+/);
    if (names.length === 1) return name;
    
    return `${names[0]} ${names[names.length - 1].charAt(0)}.`;
  };

  //get main category name and section name from utilsCategories js file
  //We cannot directly get this data as we have done it in BtmSection file
  //Because in BtmSection file, the input for the function is coming easily from route parameters
  //here the input for the function is coming from database. Thats why we are using useEffect
  //And we have to wait a little with loading state until message variable gets data from db
  useEffect(() => {
    if (loading === false && message?.sub_group) {
      setMainCategoryNum( Number(message.main_group) );
      setSectionNum( Number(message.sub_group) );
      
      setTitleMainCategory(detectCategory(mainCategoryNum));
      setTitleSection(detectSection(sectionNum));
    }
  }, [message, loading]);

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
    navigate(`/section/${sectionNum}`)
  }
  const goSeller = () => {
    if (message?.user_id > 0) {
      navigate(`/seller/${Number(message.user_id)}`)
    }
  }

  const handleVisitorsItem = (num) => {
    setVisitorsItem(num)
  }

  return ( 
    <div>
      <div className='itemMainContainer'>
        { loading ? 
            <div aria-live="polite">Ielādē...</div> 
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
                  <div className='itemDetailsArea'>
                    <span className='itemCategoryLinks' onClick={goMain}>{titleMainCategory}</span>
                    &nbsp;&nbsp;/&nbsp;&nbsp;
                    <span className='itemCategoryLinks' onClick={goSection}>{titleSection}</span>
                  </div>
                  <div className='itemDetailsArea'><h2>{message.title}</h2> </div>
                  <div className='itemDetailsArea'>{message.description}</div>
                  <div className='itemDetailsArea otherDetailsArea'>
                    <div><span className='grayText'>Pilsēta, pagasts vai rajons:</span><span>    {message.city}</span></div>
                    <div><span className='grayText'>Cena:</span><span>    {message.price}</span></div>
                    <div>
                      <span className='grayText'>Telefons:    </span>
                      <span className='phoneNumber' onClick={() => setShowFullPhone(!showFullPhone)}>
                        {formatPhoneNumber(message?.telephone)}</span>
                    </div>
                    <div>
                      <span className='grayText'>Vārds:</span>
                      <span className='itemCategoryLinks' onClick={goSeller}>    {formatName(message?.name)}</span></div>
                    <br/>
                    <BtmLikeItem itemId={itemNumber}  />
                    <div className='smallText'><span>Datums:</span><span>    {message.date}</span></div>
                    <div className='smallText'><span>Skatījumu skaits: {visitorsItem}</span></div>
                  </div>
                </>
              ) : (
                <p>Nav pieejamu datu</p>
              )}
            </>
        }
      </div>
      <div> <br/><br/><br/><br/> </div>
      <div> <CommentDisplay commentReceiver={itemNumber} /></div>
      <br/><br/><br/><br/><br/><br/>
      <div className='FooterContainer'>
        <Footer />
      </div>
      {!loading && mainCategoryNum > 0 && sectionNum > 0 && (
        <BtmVisitor
          itemId={itemNumber}
          itemMainCategory={mainCategoryNum}
          itemSubCategory={sectionNum}
          handleVisitorsItem={handleVisitorsItem}
        />
      )}
    </div>
  )
}

export default BtmItem;