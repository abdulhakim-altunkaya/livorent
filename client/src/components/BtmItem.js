import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";
import "../styles/Item.css"
import Footer from "./Footer.js";
import { detectSection, detectCategory } from './utilsCategories';
import useUserStore from '../store/userStore';

function BtmItem() {
  const navigate = useNavigate();

  const { itemNumber } = useParams();
  
  //we will check zustand store to see if there is any user data in it. If there is
  //then no need to make repetitive requests to backend.
  //We will use cachedUserData to let the visitor to leave a like. Only registered people can like.
  const { cachedUserData } = useUserStore.getState();

  const debounceTimer = useRef(null);//we will use this to force wait time on like clicks

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
  //states for like logic
  const [isLikeAllowed, setIsLikeAllowed] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

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

  const handleLike = () => {
    // Check if visitor is logged in
    if (!cachedUserData || !cachedUserData.id) {
      alert("To leave a like, you need to login");
      setIsLikeAllowed(!isLikeAllowed)
      return;
    }
    const newLikeState = !isLiked;
    setIsLiked(newLikeState);
    // Clear previous timeout if it exists
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    // Set a new debounce timer
    debounceTimer.current = setTimeout(() => {
      saveLike(newLikeState);
    }, 10000); // delay in milliseconds (10s here)
  };
  const saveLike = async (likeState) => {
    try {
      console.log('Like after 10 seconds:', likeState);
      const response = await axios.post('http://localhost:5000/api/like/items', {
        likeStatus: likeState,
        likedId: message.id, 
        userId: cachedUserData?.id,
      });
      console.log('Like after 10 seconds:', response.data.myMessage);
    } catch (error) {
      console.error('Error saving like:', error);
    }
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
                    <div>
                      {
                        isLiked ?
                          <img className='heartIcon' onClick={handleLike} src='/svg_heart_filled.svg' alt='full heart'/>
                        :
                          <img className='heartIcon' onClick={handleLike} src='/svg_heart.svg' alt='empty heart'/>
                      }
                      {
                        isLikeAllowed ?
                         <></>
                        :
                        <div className="noUserBtmUpload">
                          Lai atzīmētu ar "patīk", jābūt reģistrētam.
                          <span onClick={() => navigate("/login")}> Ieiet</span> vai 
                          <span onClick={() => navigate("/registration")}> reģistrēties</span>.
                        </div>
                      }
                    </div>
                    <div className='smallText'><span>Datums:</span><span>    {message.date}</span></div>
                    <div className='smallText'><span>Unikālo apmeklējumu skaits:</span><span></span></div>
                    
                  
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