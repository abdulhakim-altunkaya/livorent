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
import BtmSection from "./BtmSection";
import BtmProfileUpdate from "./BtmProfileUpdate";
import BtmProfileAdUpdate from "./BtmProfileAdUpdate";
import BtmSeller from "./BtmSeller";
import BtmSearch from "./BtmSearch";
import BtmRenewal from "./BtmRenewal";
import BtmPasswordChange from "./BtmPasswordChange";


function Bottom() {
  return (
    <div className='bottomArea'>
      <Routes>
        <Route path="/machines-construction" element={<AdsMasinas/>} />
        <Route path="/hobbies" element={<AdsHobi/>} />
        <Route path="/electronics-instruments" element={<AdsElectro/>} />
        <Route path="/clothes" element={<AdsApgerbi/>} />
        <Route path="/event-organization" element={<AdsPasakumi/>} />
        <Route path="/vehicles" element={<AdsTransport/>} />

        <Route path="/upload" element={<BtmUpload/>} />
        <Route path="/item/:itemNumber" element={<BtmItem />} />
        <Route path="/section/:sectionNumber" element={<BtmSection />} />

        <Route path="/profile/update-account/:visitorNumber" element={<BtmProfileUpdate />} />
        <Route path="/profile/update-ad/:adNumber" element={<BtmProfileAdUpdate />} />
        <Route path="/profile/:visitorNumber" element={<BtmProfile />} />
        <Route path="/seller/:sellerNumber" element={<BtmSeller />} />
        <Route path="/registration" element={<BtmRegister />} />
        <Route path="/login" element={<BtmLogin />} />
        <Route path="/password-reset" element={<BtmRenewal />} />
        <Route path="/password-change" element={<BtmPasswordChange />} />
        <Route path="/search" element={<BtmSearch />} />
        <Route path="*" element={<BtmHome/>} />
      </Routes>
    </div>
  )
}

export default Bottom;