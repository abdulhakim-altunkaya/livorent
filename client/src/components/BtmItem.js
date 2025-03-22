import React from 'react'
import { useParams } from "react-router-dom";

function BtmItem() {
  const { itemNumber } = useParams();

  return ( 
    <div>
      <div>
        <div>Title: {itemNumber}</div>
        <div>Carousel</div>
        <div>Description</div>
        <div>Price</div>
        <div> <span>Name</span> <span>Telephone</span> </div>
      </div>
    </div>
  )
}

export default BtmItem