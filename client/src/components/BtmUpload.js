import React, {useState} from "react";
import axios from "axios";
import "../styles/upload.css";
import Footer from "./Footer";

function BtmUpload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [telephone, setTelephone] = useState("");
  const [images, setImages] = useState([]); // New state for image files
  const [resultArea, setResultArea] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const visitorNumberFromStorage = Number(localStorage.getItem("visitorNumber"));

  const saveCategoryNumber = (n) => {
    setSelectedCategory(n);
  }

  const handleImageChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 4) {
      alert("You can upload a maximum of 4 images.");
      return;
    }
    setImages(selectedFiles);
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
    try {
      const adObject = {
        adTitle: title, 
        adDescription: description, 
        adPrice: price, 
        adCity: city, 
        adName: name, 
        adTelephone: telephone,
        adCategory: selectedCategory,
        adVisitorNumber: visitorNumberFromStorage,
      };
      console.log(adObject);


      const formData = new FormData();
      formData.append("adData", JSON.stringify(adObject)); // Send ad data as JSON string

        // ✅ Check if images array has between 1 and 4 images
        if (images.length >= 1 && images.length <= 4) {
          images.forEach((image) => {
            const uniqueFileName = generateUniqueFileName();
            const renamedFile = new File([image], uniqueFileName, { type: image.type });
            formData.append("images", renamedFile);
          });
        } else {
          alert("Lūdzu, augšupielādējiet vismaz 1 un ne vairāk kā 4 attēlus.");  // Latvian: Please upload at least 1 and no more than 4 images.
        }

      const res1 = await axios.post("http://localhost:5000/serversavead", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResultArea(res1.data.myMessage);

    } catch (error) {
      if (error.response) {
        setResultArea(error.response.data.myMessage);
        console.log(error.message);
      } else {
        setResultArea("An error happened while saving the news");
        console.log(error.message);
      }
    }
  }

  return (
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
          
          <div className="formRow">
            <div className="formInputs">
              <label htmlFor="inputName">Vārds:</label>
              <input className="inputFieldShort" type="text" id="inputName"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="formInputs">
              <label htmlFor="inputTelephone">Tālrunis:</label>  
              <input className="inputFieldShort" type="number" id="inputTelephone" 
                value={telephone} onChange={(e) => setTelephone(e.target.value)} required />
            </div>
          </div>
                
          

        <div className="btnUploadArea" >
          {/* Hide the default file input */}
          <input
            type="file"
            id="inputImages"
            name="images"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            style={{
              opacity: 0, // Make the input invisible
              position: 'absolute', // Position it absolutely
              left: 0,
              top: 0,
              cursor: 'pointer', // Show pointer cursor
            }}
          />
          {/* Custom button */}
          <label
            htmlFor="inputImages" // Associate the label with the input
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '18px',
              width: "240px",
              display: 'inline-block',
              textAlign: "center",
              alignSelf: "center"
            }}
          >
            Upload Images <img src='/svg_add_file.svg' className="svgUploadFile" alt='add file icon'/>
          </label>

        </div>
          {/* Display selected file names */}
          <div className="selectedFilesText">
              {images.length > 0
                ? images.map((file) => file.name).join(", ")
                : "Nav izvēlēts neviens attēls"}
          </div>

          <div>
            <div className="btnSelectCategory" >
              <span>Choose Ad Category</span> &nbsp;&nbsp;<span>▼</span>

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

          <button className="button7007" type="submit">Augšupielādēt</button>
        </form>
        <div>{resultArea}</div>
      </div>
{/*       title-text
      description-text
      price (per day, per hour, per week or per month)-number with two decimals
      telephone-numbers without decimals
      name-text 
      City-text

      keep it longer weeks? numbers without decimals
      Make title bolder? True or false
      move it to the top? True or false

      location ip 
      date */}
      <br /><br /><br /><br /><br /><br /><br /><br />
      <Footer />
    </div>
  )
}

export default BtmUpload