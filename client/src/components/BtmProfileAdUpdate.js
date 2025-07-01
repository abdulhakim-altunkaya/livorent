import {useEffect, useState, useRef} from "react";
import { useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import "../styles/upload.css";
import "../styles/ProfileAdUpdate.css";
import Footer from "./Footer";
import { getUserId } from './utilsAuth'; 
import useUserStore from '../store/userStore';
import { jwtDecode } from 'jwt-decode';

function BtmProfileAdUpdate() {

  const navigate = useNavigate();
  const { adNumber } = useParams();
  const isSaving = useRef(false);  // flag to prevent repetitive requests and duplicates

  //we will check if there is token and user id exist in local storage. If there is 
  //we will let the visitor to see upload component. The lines below are for this purpose
  //they will check that by using utilsAuth function. if user id is not bigger than 1, than it means
  //visitor is not registered and cannot upload.
  const userIdData = getUserId(); // This returns an object { userNumber }
  const userId = userIdData.userNumber; // Get the actual number

  //The same as userId. This one we will send to backend. We can send the userId also, it is the same.
  const visitorNumberFromStorage = Number(localStorage.getItem("visitorNumber"));

  //we cached item data when item (an ad among the table of ads) was clicked on BtmProfile page. 
  //then we navigated to this component. Now, instead of making a request to backend and database to fetch
  //item data we can easily get it from cached item data.
  const { cachedItemData } = useUserStore.getState();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [oldImages, setOldImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [displayImages, setDisplayImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [resultArea, setResultArea] = useState("");
  const [missingData, setMissingData] = useState(false); // 🔑
  const [removedImages, setRemovedImages] = useState([]);
  const token = localStorage.getItem("token_livorent"); 

  useEffect(() => {
      //Check 1: Only people with token can open ad update page. 
      if (!token) {
        navigate("/login"); // Redirect if no token
        return;
      }
      //Check 2: People with inconsistent id numbers will be directed to login.
      try {
        const decoded = jwtDecode(token);
        const tokenUserId = decoded.userId;
  
        if (String(tokenUserId) !== String(visitorNumberFromStorage)) {
          navigate("/login"); 
          return;
        }
      } catch (err) {
        console.error("Invalid token:", err);
        navigate("/login");
        return;
      }
  }, [])

  useEffect(() => {
    if (!cachedItemData || !cachedItemData.title) {
      setMissingData(true);
      return;
    }
    setTitle(cachedItemData.title);
    setDescription(cachedItemData.description);
    setPrice(cachedItemData.price);
    setCity(cachedItemData.city);
    setOldImages(cachedItemData.image_url);
    setSelectedCategory(cachedItemData.sub_group);
  }, [cachedItemData]);

  useEffect(() => {
    if (missingData) {
      alert("Dati zuduši lapas atsvaidzināšanas dēļ. Neatsvaidziniet lapu, kamēr atjaunojat sludinājumu. Atgriezieties profilā.");
      navigate("/"); // or wherever your profile page is
    }
  }, [missingData, navigate]);


  const saveCategoryNumber = (n) => {
    setSelectedCategory(n);
  } 

  const handleImageChange = (e) => {
    //1. ADD IMAGES TO NEWIMAGES ARRAY TO MAKE THEM READY FOR DATABASE
    //selected images arrive, control checks and add them to newImages array
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length + oldImages.length > 5) {
      alert("Maksimāli 5 bildes");
      return;
    }
    if (selectedFiles.length + oldImages.length < 1) {
      alert("Vismaz 1 bilde");
      return;
    }
    setNewImages(selectedFiles); // Only tracks newly added files 
    
    // 2.DISPLAY THE IMAGES BEFORE UPLOADING
    // Create preview URLs for each image. Before sending new images to db, I want to display them just like 
    // old images. Old images have public url links from db thats why it is easy to display them. New images 
    // dont have public url, so, I will create a url link for each of them. This url links are only for display
    // purpose, I dont need to send them to database. 
    const imagePreviews = selectedFiles.map(file => ({
      file, // Keep the file object for later upload
      preview: URL.createObjectURL(file) // Create a preview URL
    }));
    setDisplayImages(imagePreviews);
  };

  //files names of visitors can crash the database or server. So, we will convert them to 
  //random alfanumerical number here before sending it to backend.
  function generateUniqueFileName() {
    const letters = Array.from({ length: 5 }, () =>
      String.fromCharCode(65 + Math.floor(Math.random() * 26))
    ).join('');
    const numbers = Array.from({ length: 5 }, () =>
      Math.floor(Math.random() * 10)
    ).join('');
    return `${letters}${numbers}`; // Example: ABCDE12345
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || title.trim().length < 20 || title.trim().length > 400) {
      setResultArea("Virsraksts ir pārāk īss vai pārāk garš. Minimums 20, maksimums 400 rakstzīmes.");
      return;
    }
    if (!description || description.trim().length < 50 || description.trim().length > 2000) {
      setResultArea("Apraksts ir pārāk īss vai pārāk garš. Minimums 50, maksimums 2000 rakstzīmes.");
      return;
    }
    if (!price || price.trim().length < 1 || price.length > 40) {
      setResultArea("Lūdzu, norādiet derīgu cenu.");
      return;
    }
    if (!city || city.trim().length < 3 || city.length > 40) {
      setResultArea("Lūdzu, ievadiet derīgu pilsētas nosaukumu (vismaz 3 rakstzīmes).");
      return;
    }
    if (!selectedCategory || Number(selectedCategory) < 10 || Number(selectedCategory) > 99) {
      setResultArea("Izvēlēta nederīga kategorija.");
      return;
    }
    if (!visitorNumberFromStorage || Number(visitorNumberFromStorage) < 1 || Number(visitorNumberFromStorage) > 1000000) {
      setResultArea("Nederīgs apmeklētāja ID.");
      return;
    }

    // prevent duplicates
    if (isSaving.current) return; 
    isSaving.current = true;
    try {
      const adUpdateObject = {
        adNumber: adNumber,
        adTitle: title, 
        adDescription: description, 
        adPrice: price, 
        adCity: city, 
        adCategory: selectedCategory,
        adVisitorNumber: visitorNumberFromStorage,
        adOldImages: oldImages,
        adRemovedImages: removedImages,
      };
      if (newImages.length + oldImages.length < 1 || newImages.length + oldImages.length > 5) {
        alert("Lūdzu, augšupielādējiet vismaz 1 un ne vairāk kā 5 attēlus.");  // Latvian: Please upload at least 1 and no more than 4 images.
        return;
      }
      const formData = new FormData();
      formData.append("adUpdateData", JSON.stringify(adUpdateObject)); // adUpdateData we will access it from backend

      if (newImages.length >= 0 && newImages.length <= 5) {
        newImages.forEach( (image) => {
          const uniqueFileName = generateUniqueFileName();
          const renamedFile = new File([image], uniqueFileName, { type: image.type })
          formData.append("adUpdateImages", renamedFile);
        });
      } else {
        alert("Lūdzu, augšupielādējiet vismaz 1 un ne vairāk kā 5 attēlus.");  // Latvian: Please upload at least 1 and no more than 4 images.
        return;
      }
      const res1 = await axios.patch("http://localhost:5000/api/profile/update-ad", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`, // Add the token here
        },
      });
      setResultArea(`${res1.data.myMessage} ✅`);  // Emoji U+2705
      setTimeout(() => {
      }, 2000); // 2 seconds might help
      navigate(`/profile/${adUpdateObject.adVisitorNumber}`)
    } catch (error) {
      if (error.response && error.response.data) {
        const { resMessage, resErrorCode } = error.response.data;

        if (resErrorCode === 1) {
          setResultArea("Nederīgs sludinājuma datu formāts ❌");
        } else if (resErrorCode === 2) {
          setResultArea("Virsraksts vai apraksts nav derīgs ❌");
        } else if (resErrorCode === 3) {
          setResultArea("Pilsētas vai cenas informācija nav derīga ❌");
        } else if (resErrorCode === 4) {
          setResultArea("Apmeklētāja numurs nav derīgs ❌");
        } else if (resErrorCode === 5) {
          setResultArea("Sludinājuma kategorija nav derīga ❌");
        } else if (resErrorCode === 6) {
          setResultArea("Nepieļaujams faila tips ❌");
        } else if (resErrorCode === 7) {
          setResultArea("Kļūda augšupielādējot failu glabātuvē ❌");
        } else if (resErrorCode === 8) {
          setResultArea("Nevar būt vairāk par 5 attēliem ❌");
        } else if (resErrorCode === 9) {
          setResultArea("Neizdevās izveidot savienojumu ar datubāzi ❌");
        } else {
          setResultArea((resMessage || "Nezināma kļūda") + " ❌");
          console.log(error);
        }
      } else {
        setResultArea("Tīkls vai neparedzēta kļūda ❌");
        console.log(error);
      }
    } finally {
      isSaving.current = false;
    }
  }

  const deleteImg = async (imageLink) => {
    try {
      setRemovedImages(prev => [...prev, imageLink]);

      // 1. Delete from Supabase
      //await axios.patch("http://localhost:5000/api/profile/delete-image", {imageLink, adNumber});
      // 2. Update local state (remove the deleted image)
      setOldImages(oldImages.filter(img => img !== imageLink));
    } catch (error) {
      console.log(error.message);
      setResultArea("Attēlu nevarēja dzēst");
    }
  }
  const deleteImgDisplay = (imageLink) => {
    try {
      console.log("delete display image clicked", imageLink)
      // 2. Update local state (remove the deleted image)
      setDisplayImages(displayImages.filter(img => img.preview !== imageLink.preview));
    } catch (error) {
      console.log(error.message);
      setResultArea("Attēlu nevarēja dzēst");
    }
  }




  return (
    <>
    {
        userId < 1 ?
        (
          <div className="noUserBtmUpload">Lai pievienotu sludinājumus, jābūt reģistrētam. 
            <span onClick={() => navigate("/login")}>  Ieiet</span> vai <span
            onClick={() => navigate("/registration")}>reģistrēties</span>.
          </div>
        ) 
        :
        (
          <div>
            <div className="adFormArea">
              <form className="adForm" onSubmit={handleSubmit}>
      
                <div className="formInputs">
                  <label htmlFor="inputTitle">Virsraktsts:</label>
                  <input className="inputFieldLong" type="text" id="inputTitle" 
                    value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
      
                <div className="formInputs">
                  <label htmlFor="inputDescription">Apraksts:</label>
                  <textarea className="textAreaClass" type="text" id="inputDescription" 
                    value={description} onChange={(e) => setDescription(e.target.value)} required rows="6" >
                  </textarea>
                </div>
      
                <div className="formRow">
                  <div className="formInputs">
                    <label htmlFor="inputPrice">Cena:</label>
                    <input className="inputFieldShort" type="text" id="inputPrice" 
                      value={price} onChange={(e) => setPrice(e.target.value)} required />
                  </div>
                  <div className="formInputs">
                    <label htmlFor="inputCity">Pilsēta:</label>
                    <input className="inputFieldShort" type="text" id="inputCity"
                      value={city} onChange={(e) => setCity(e.target.value)} required  />
                  </div>
                </div>
            
              <div className="btnUploadArea" >
                {/* Hide the default file input */}
                <input type="file" id="inputImages" name="adUpdateImages" accept="image/*" multiple 
                  onChange={handleImageChange} />
                <label htmlFor="inputImages" >
                  Augšupielādēt attēlus <img src='/svg_add_file.svg' className="svgUploadFile" alt='add file icon'/>
                </label>
              </div>
              <div className="selectedFilesText">
                {newImages.length > 0 || oldImages.length > 0 
                    ? <></>
                    : "Nav izvēlēts neviens attēls"}
              </div>
              <div>
                <br/>
                <div>
                  {oldImages.map((imageLink, index) => (
                    <div className="updateImgArea" key={index}>
                      <span className='updateImgSpan'>
                        <img className='updateImg' src={imageLink} alt='a small pic of ad'/>
                      </span>
                      <span className="updateImgDeleteIconSpan">
                        <img src='/svg_delete.svg' className='updateImgDeleteIcon' 
                        onClick={() => deleteImg(imageLink)} alt='Delete icon'/>
                      </span>
                    </div>
                  ))}
                </div>
                <div>
                  {displayImages.map((imageLink, index) => (
                    <div className="updateImgArea" key={index}>
                      <span className='updateImgSpan'>
                        <img className='updateImg' src={imageLink.preview} alt='a small pic of ad'/>
                      </span>
                      <span className="updateImgDeleteIconSpan">
                        <img src='/svg_delete.svg' className='updateImgDeleteIcon' 
                         onClick={() => deleteImgDisplay(imageLink)} alt='Delete icon'/>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
                <div>
                  <div className="btnSelectCategory" >
                    <span>Izvēlies sludinājuma kategoriju</span> &nbsp;&nbsp;<span>▼</span>
      
                  </div>
                      <div className="selectCategoryArea">
                        <div className="selectCategoryAreaDiv">
                          <span className="selectCategoryTitle">&#128978;Mašīnas, būvniecība&#128978;</span>
                          <span className={`selectCategoryList ${selectedCategory === 11 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(11)}>Masti, torņi, konstrukcijas</span>
                          <span className={`selectCategoryList ${selectedCategory === 12 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(12)}>Santehnika</span>
                          <span className={`selectCategoryList ${selectedCategory === 13 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(13)}>Kompresori</span>
                          <span className={`selectCategoryList ${selectedCategory === 14 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(14)}>Pārvadāšana un iekraušana</span>
                          <span className={`selectCategoryList ${selectedCategory === 15 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(15)}>Ģeneratori</span>
                          <span className={`selectCategoryList ${selectedCategory === 16 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(16)}>Mērinstrumenti</span>
                          <span className={`selectCategoryList ${selectedCategory === 17 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(17)}>Mazgāšanas aprīkojums</span>
                          <span className={`selectCategoryList ${selectedCategory === 18 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(18)}>Citi</span>
                        </div>
      
                        <div className="selectCategoryAreaDiv">
                          <span className="selectCategoryTitle">&#128978;Instrumenti, elektronika&#128978;</span>
                          <span className={`selectCategoryList ${selectedCategory === 21 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(21)}>Telefoni</span>
                          <span className={`selectCategoryList ${selectedCategory === 22 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(22)}>Datori</span>
                          <span className={`selectCategoryList ${selectedCategory === 23 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(23)}>Virtuves tehnika</span>
                          <span className={`selectCategoryList ${selectedCategory === 24 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(24)}>Biroja tehnika</span>
                          <span className={`selectCategoryList ${selectedCategory === 25 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(25)}>Baterijas, Akumulatori</span>
                          <span className={`selectCategoryList ${selectedCategory === 26 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(26)}>Apgaismojums, Televizori</span>
                          <span className={`selectCategoryList ${selectedCategory === 27 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(27)}>Foto un optika</span>
                          <span className={`selectCategoryList ${selectedCategory === 28 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(28)}>Dārza tehnika</span>
                          <span className={`selectCategoryList ${selectedCategory === 29 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(29)}>Citi</span>
                        </div>
      
                        <div className="selectCategoryAreaDiv">
                          <span className="selectCategoryTitle">&#128978;Transportlīdzekļi&#128978;</span>
                          <span className={`selectCategoryList ${selectedCategory === 31 ? "selected" : ""}`}
                            onClick={() => saveCategoryNumber(31)}>Vieglie auto</span>
                          <span className={`selectCategoryList ${selectedCategory === 32 ? "selected" : ""}`}
                            onClick={() => saveCategoryNumber(32)}>Velosipēdi, skūteri</span>
                          <span className={`selectCategoryList ${selectedCategory === 33 ? "selected" : ""}`}
                            onClick={() => saveCategoryNumber(33)}>Kravas automašīnas</span>
                          <span className={`selectCategoryList ${selectedCategory === 34 ? "selected" : ""}`}
                            onClick={() => saveCategoryNumber(34)}>Traktori</span> 
                          <span className={`selectCategoryList ${selectedCategory === 35 ? "selected" : ""}`}
                            onClick={() => saveCategoryNumber(35)}>Lauksaimniecības mašīnas</span>
                          <span className={`selectCategoryList ${selectedCategory === 36 ? "selected" : ""}`}
                            onClick={() => saveCategoryNumber(36)}>Piekabes</span>
                          <span className={`selectCategoryList ${selectedCategory === 37 ? "selected" : ""}`}
                            onClick={() => saveCategoryNumber(37)}>Jumta kastes</span>
                          <span className={`selectCategoryList ${selectedCategory === 38 ? "selected" : ""}`}
                            onClick={() => saveCategoryNumber(38)}>Ūdens transports </span>
                          <span className={`selectCategoryList ${selectedCategory === 39 ? "selected" : ""}`}
                            onClick={() => saveCategoryNumber(39)}> Citi </span>
                        </div>
      
                        <div className="selectCategoryAreaDiv">
                          <span className="selectCategoryTitle">&#128978;Apģērbi, apavi&#128978;</span>
                          <span className={`selectCategoryList ${selectedCategory === 41 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(41)}>Sieviešu apģērbi</span>
                          <span className={`selectCategoryList ${selectedCategory === 42 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(42)}>Vīriešu apģērbi</span>
                          <span className={`selectCategoryList ${selectedCategory === 43 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(43)}>Sieviešu apavi</span>
                          <span className={`selectCategoryList ${selectedCategory === 44 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(44)}>Vīriešu apavi</span>
                          <span className={`selectCategoryList ${selectedCategory === 45 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(45)}>Aksesuāri</span>
                          <span className={`selectCategoryList ${selectedCategory === 46 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(46)}>Sieviešu somiņas</span>
                          <span className={`selectCategoryList ${selectedCategory === 47 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(47)}>Mugursomas un Čemodāni</span>
                          <span className={`selectCategoryList ${selectedCategory === 48 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(48)}>Citi</span>
                        </div>
      
                        <div className="selectCategoryAreaDiv">
                          <span className="selectCategoryTitle">&#128978;Hobijs&#128978;</span>
                          <span className={`selectCategoryList ${selectedCategory === 51 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(51)}>Sporta aprīkojums</span>
                          <span className={`selectCategoryList ${selectedCategory === 52 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(52)}>Medības, kempings</span>
                          <span className={`selectCategoryList ${selectedCategory === 53 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(53)}>Mūzikas instrumenti</span>
                          <span className={`selectCategoryList ${selectedCategory === 54 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(54)}>Slidošana</span>
                          <span className={`selectCategoryList ${selectedCategory === 55 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(55)}>Rokdarbi</span>   
                          <span className={`selectCategoryList ${selectedCategory === 56 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(56)}>Citi</span>
                        </div>
      
                        <div className="selectCategoryAreaDiv">
                          <span className="selectCategoryTitle">&#128978;Pasākumi&#128978;</span>
                          <span className={`selectCategoryList ${selectedCategory === 61 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(61)}>Dekorācijas</span>
                          <span className={`selectCategoryList ${selectedCategory === 62 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(62)}>Dzīvnieki</span>
                          <span className={`selectCategoryList ${selectedCategory === 63 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(63)}>Mēbeles un Paklāji</span>
                          <span className={`selectCategoryList ${selectedCategory === 64 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(64)}>Inventārs aktīvai atpūtai</span>
                          <span className={`selectCategoryList ${selectedCategory === 65 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(65)}>Atrakciju noma</span>
                          <span className={`selectCategoryList ${selectedCategory === 66 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(66)}>Trauki, galda rīki</span>
                          <span className={`selectCategoryList ${selectedCategory === 67 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(67)}>Kostīmi</span>
                          <span className={`selectCategoryList ${selectedCategory === 68 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(68)}>Pirtis</span>
                          <span className={`selectCategoryList ${selectedCategory === 69 ? "selected" : ""}`}
                          onClick={() => saveCategoryNumber(69)}>Citi</span>
                        </div>
      
                      </div>
                </div>
      
                <button className="button7007" type="submit" disabled={isSaving.current} >
                  {isSaving.current ? "Saglabā..." : "Atjaunināt"}
                </button>
              </form>
              <br/>
              <div>{resultArea}</div>
            </div>
            <br /><br /><br /><br /><br /><br /><br /><br />
            <Footer />
          </div>
        )
      
    }
    
    </>
  )
}

export default BtmProfileAdUpdate



