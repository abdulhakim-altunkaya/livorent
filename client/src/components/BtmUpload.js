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
  const [telephone, setTelephone] = useState(null);
  const [images, setImages] = useState([]); // New state for image files
  const [resultArea, setResultArea] = useState("");
  const [isList, setIsList] = useState(false);

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
        adTelephone: telephone
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
                
          {/* Image Upload Section */}
          <div className="formInputs">
            {/* Custom File Upload Button */}
            <label htmlFor="inputImages" className="customFileUpload">
              <svg
                aria-hidden="true"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                width="60"
                height="60" 
              >
                <path
                  stroke-width="2"
                  stroke="#ffffff"
                  d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H11M13.5 3L19 8.625M13.5 3V7.625C13.5 8.17728 13.9477 8.625 14.5 8.625H19M19 8.625V11.8125"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                ></path>
                <path
                  stroke-linejoin="round"
                  stroke-linecap="round"
                  stroke-width="2"
                  stroke="#ffffff"
                  d="M17 15V18M17 21V18M17 18H14M17 18H20"
                ></path>
              </svg>
              Izvēlieties attēlus (maks. 4)
            </label>

            <input
              type="file"
              id="inputImages"
              name="images"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              style={{ display: "none" }} // ✅ Hide the default file input
            />

            {/* Display selected file names */}
            <div className="selectedFilesText">
              {images.length > 0
                ? images.map((file) => file.name).join(", ")
                : "Nav izvēlēts neviens attēls"}
            </div>
          </div>

          <div className="selectArea">
            <div className="selectTitle" onClick={ () => setIsList(!isList)}>
              <span>Choose Ad Category</span> <span>▼</span>

            </div>
            {
              isList ? (
                <div className="selectCategoryArea">

                  <div>
                    <span className="selectCategoryTitle">Mašīnas, būvniecība</span>
                    <span className="selectCategoryList">Masti, torņi, konstrukcijas</span>
                    <span className="selectCategoryList">Santehnika</span>
                    <span className="selectCategoryList">Kompresori</span>
                    <span className="selectCategoryList">Pārvadāšana un iekraušana</span>
                    <span className="selectCategoryList">Ģeneratori</span>
                    <span className="selectCategoryList">Mērinstrumenti</span>
                    <span className="selectCategoryList">Mazgāšanas aprīkojums</span>
                    <span className="selectCategoryList">Citi</span>
                  </div>

                  <div>
                    <span className="selectCategoryTitle">Instrumenti, elektronika</span>
                    <span className="selectCategoryList">Telefoni</span>
                    <span className="selectCategoryList">Datori</span>
                    <span className="selectCategoryList">Virtuves tehnika</span>
                    <span className="selectCategoryList">Biroja tehnika</span>
                    <span className="selectCategoryList">Baterijas, Akumulatori</span>
                    <span className="selectCategoryList">Apgaismojums, Televizori</span>
                    <span className="selectCategoryList">Foto un optika</span>
                    <span className="selectCategoryList">Dārza tehnika</span>
                    <span className="selectCategoryList">Citi</span>
                  </div>

                  <div>
                    <span className="selectCategoryTitle">Transportlīdzekļi</span>
                    <span className="selectCategoryList">Vieglie auto</span>
                    <span className="selectCategoryList">Velosipēdi, skūteri</span>
                    <span className="selectCategoryList">Kravas automašīnas</span>
                    <span className="selectCategoryList">Traktori</span>
                    <span className="selectCategoryList">Lauksaimniecības mašīnas</span>
                    <span className="selectCategoryList">Piekabes</span>
                    <span className="selectCategoryList">Jumta kastes</span>
                    <span className="selectCategoryList">Ūdens transports</span>
                    <span className="selectCategoryList">Citi</span>
                  </div>

                  <div>
                    <span className="selectCategoryTitle">Apģērbi, apavi</span>
                    <span className="selectCategoryList">Sieviešu apģērbi</span>
                    <span className="selectCategoryList">Vīriešu apģērbi</span>
                    <span className="selectCategoryList">Sieviešu apavi</span>
                    <span className="selectCategoryList">Vīriešu apavi</span>
                    <span className="selectCategoryList">Aksesuāri</span>
                    <span className="selectCategoryList">Sieviešu somiņas</span>
                    <span className="selectCategoryList">Mugursomas un Čemodāni</span>
                    <span className="selectCategoryList">Citi</span>
                  </div>

                  <div>
                    <span className="selectCategoryTitle">Hobijs</span>
                    <span className="selectCategoryList">Sporta aprīkojums</span>
                    <span className="selectCategoryList">Medības, kempings</span>
                    <span className="selectCategoryList">Mūzikas instrumenti</span>
                    <span className="selectCategoryList">Slidošana</span>
                    <span className="selectCategoryList">Rokdarbi</span>   
                    <span className="selectCategoryList">Citi</span>
                  </div>

                  <div>
                    <span className="selectCategoryTitle">Pasākumi</span>
                    <span className="selectCategoryList">Dekorācijas</span>
                    <span className="selectCategoryList">Dzīvnieki</span>
                    <span className="selectCategoryList">Mēbeles un Paklāji</span>
                    <span className="selectCategoryList">Inventārs aktīvai atpūtai</span>
                    <span className="selectCategoryList">Atrakciju noma</span>
                    <span className="selectCategoryList">Trauki, galda rīki</span>
                    <span className="selectCategoryList">Kostīmi</span>
                    <span className="selectCategoryList">Pirtis</span>
                    <span className="selectCategoryList">Citi</span>
                  </div>

                </div>
              ) : null

            }

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