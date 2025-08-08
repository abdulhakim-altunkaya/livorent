import { useNavigate } from "react-router-dom";
import '../styles/Footer.css';

const Footer = () => {
  
  const navigate = useNavigate();
  
  return (
    <div>
      <div className='borderTop'></div>
      <footer className="footer" role="contentinfo" aria-label="Footer">
        <div className='footerIcon' >
          <img src='/tory.png' alt='Website Manager' onClick={ () => navigate("/about") }/>
        </div>
        <div className="footerContent1">
          E-mail:&nbsp;&nbsp;<a href="mailto:torysoftware@gmail.com" 
            aria-label="Email contact to torysoftware@gmail.com">torysoftware@gmail.com</a>
          <p>Ikonas:&nbsp;&nbsp;<a href="https://icons8.com/icons" target="_blank" rel="noopener noreferrer" 
              aria-label="Link to icons8 website for the icons used on this website">icons8.com</a></p>
          SVG ikonas:&nbsp;&nbsp;<a href="https://www.svgrepo.com" target="_blank" rel="noopener noreferrer" 
              aria-label="Link to svgrepo website for the svg icons used on this website">svgrepo.com</a>
        </div>
        <div className="footerContent2">
          <div>
            <a href="https://ipradar.org/" aria-label="Email contact to torysoftware@gmail.com">
              ipradar.org</a>
            <a href="https://unitzap.space/" aria-label="Email contact to torysoftware@gmail.com">
              unitzap.space</a>
          </div>
          <div>
            <a href="https://visacalculator.org/" aria-label="Email contact to torysoftware@gmail.com">
              visacalculator.org</a>
            <a href="https://einsteincalculators.com/" aria-label="Email contact to torysoftware@gmail.com">
              einsteincalculators.com</a>   
          </div>  
        </div>
      </footer>
    </div>

  );
};

export default Footer;
