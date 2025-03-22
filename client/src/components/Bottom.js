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
import BtmLogin from "./BtmLogin";
import BtmRegister from "./BtmRegister";
import BtmProfile from "./BtmProfile";
import BtmItem from "./BtmItem";

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
        <Route path="/category/:categoryId" element={<BtmHome/>} />
        <Route path="/item/:itemNumber" element={<BtmItem />} />
        <Route path="/profile/:visitorNumber" element={<BtmProfile />} />
        <Route path="/registration" element={<BtmRegister/>} />
        <Route path="/login" element={<BtmLogin/>} />
        <Route path="*" element={<BtmHome/>} />
      </Routes>
    </div>
  )
}

export default Bottom;