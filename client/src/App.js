import React from 'react';
import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Main from "./components/Main";

function App() {
  return (
    <div className='App' >
      <Router>
        <Main />
      </Router>
    </div>
    
  )
}

export default App