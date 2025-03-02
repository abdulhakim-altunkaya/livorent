import React from 'react';
import {Routes, Route} from "react-router-dom";
import BtmHome from "./BtmHome";
import BtmUpload from "./BtmUpload";
import AdsApgerbi from "./AdsApgerbi";
import AdsTransport from "./AdsTransport";
import AdsPasakumi from "./AdsPasakumi";
import AdsMasinas from "./AdsMasinas";
import AdsHobi from "./AdsHobi";
import AdsElectro from "./AdsElectro";

function Bottom() {
  return (
    <div className='bottomArea'>
      <Routes>
        <Route path="/upload" element={<BtmUpload/>} />
        <Route path="/machines-construction" element={<AdsMasinas/>} />
        <Route path="/hobbies" element={<AdsHobi/>} />
        <Route path="/electronics-instruments" element={<AdsElectro/>} />
        <Route path="/clothes" element={<AdsApgerbi/>} />
        <Route path="/event-organization" element={<AdsPasakumi/>} />
        <Route path="/vehicles" element={<AdsTransport/>} />
        <Route path="*" element={<BtmHome/>} />
      </Routes>
    </div>
  )
}

export default Bottom;