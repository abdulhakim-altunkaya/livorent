import React, {useState} from "react";
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";//for getting search input through url query 
import Footer from "./Footer";
import "../styles/Search.css"; 

function BtmSearch() {

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get("query");

  return (
    <div>
      <div className="searchArea">
        <div>
          <h1>Meklēšana</h1>
          <div>
          Search for: {searchQuery}
          </div>
        </div>
        
      </div>
      <br /><br /><br /><br /><br /><br /><br /><br />
      <Footer />
    </div>
  )
}

export default BtmSearch