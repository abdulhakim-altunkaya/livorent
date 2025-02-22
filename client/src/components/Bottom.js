import React from 'react';
import {Routes, Route} from "react-router-dom";
import BtmHome from "./BtmHome";
import BtmUpload from "./BtmUpload";
import BtmTest from "./BtmTest";

function Bottom() {
  return (
    <div className='bottomArea'>
      <Routes>
        <Route path="/upload" element={<BtmUpload/>} />
        <Route path="/test" element={<BtmTest/>} />
        <Route path="*" element={<BtmHome/>} />
      </Routes>
    </div>
  )
}

export default Bottom;