import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/Profile.css";
import Footer from "./Footer.js";
import { useParams, useNavigate } from "react-router-dom";

function BtmUpdateProfile() {
  const { visitorNumber } = useParams();
  return (
    <div>BtmUpdateProfile: {visitorNumber}</div>
  )
}

export default BtmUpdateProfile