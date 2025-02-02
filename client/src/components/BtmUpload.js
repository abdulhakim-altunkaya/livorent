import React, {useState} from "react";
import "../styles/upload.css";

function BtmUpload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [name, setName] = useState("");
  const [telephone, setTelephone] = useState(null);
  const [resultArea, setResultArea] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setResultArea("form button triggered")
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
    </div>
  )
}

export default BtmUpload