// src/components/Footer.js
import React from 'react';
import '../styles/Footer.css';

const Footer = () => {

  return (
    <footer className="footer" role="contentinfo" aria-label="Footer">
      <div className="footer-content">
        <p>E-mail: <a href="mailto:drysoftware1@gmail.com" 
          aria-label="Email contact to drysoftware1@gmail.com">drysoftware1@gmail.com</a></p>
        <p>Telephone/WhatsApp: +371 20669310 Thank you</p>
        <div className="footer-header">
          <p>Icons:&nbsp;
            <a href="https://icons8.com/icons" target="_blank" rel="noopener noreferrer" 
              aria-label="Link to icons8 website for the icons used on this website">icons8.com</a>
          </p>
          <p>SVG icons:&nbsp;
            <a href="https://www.svgrepo.com" target="_blank" rel="noopener noreferrer" 
              aria-label="Link to svgrepo website for the svg icons used on this website">svgrepo.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
