// src/components/Footer.js
import React from 'react';
import '../styles/Footer.css';

const Footer = () => {

  return (
    <footer className="footer" role="contentinfo" aria-label="Footer">
      <div className="footer-content">
        <p>E-mail: <a href="mailto:letonyaoturum@gmail.com" 
          aria-label="Email contact to letonyaoturum@gmail.com">residencylatvia@gmail.com</a></p>
        <p>Telephone/WhatsApp: +371 20669310</p>
        <div className="footer-header">
          <p>Icons:&nbsp;
            <a href="https://icons8.com/icons" target="_blank" rel="noopener noreferrer" 
              aria-label="Link to icons8 website for the icons used on this website">icons8.com</a>
          </p>
          <p>SVG icons:&nbsp;
            <a href="https://www.svgrepo.com" target="_blank" rel="noopener noreferrer" 
              aria-label="Link to svgrepo website for the svg icons used on this website">svgrepo.com</a>
          </p>
          <p>Images:&nbsp;
            <a href="https://www.wikipedia.com" target="_blank" rel="noopener noreferrer" 
              aria-label="Link to wikipedia website for the information and pictures used on this website">Wikipedia</a>
          </p>
          <p>Population Statistics:&nbsp;
            <a href="https://stat.gov.lv/en/statistics-themes/population/population/247-population-and-population-change" 
              target="_blank" rel="noopener noreferrer" 
              aria-label="Link to Latvia Statistics Bureau website for the statistics used on this website">
                Latvian Central Statistical Bureau - Centrālā Statistikas Pārvalde </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
