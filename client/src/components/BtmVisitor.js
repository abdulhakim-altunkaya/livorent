import {useEffect, useState} from 'react';
import axios from 'axios';

function BtmVisitor({ sellerId, itemId, itemMainCategory, itemSubCategory }) {

    //USE USEREF TO PREVENT DUPLICATES AND TRY CATCH FINALLY
  
    const saveItemVisit = async () => {
      try {
        const visitorObject = { 
            visitedSeller: Number(sellerId),
            visitedMainGroup: itemMainCategory,
            visitedSubGroup: itemSubCategory, 
        };
        const res1 = await axios.post("http://localhost:5000/api/post/save-like-item", visitorObject);
      } catch (error) {
        console.log(error)
      }
    }

    const saveSellerVisit = async () => {
      try {
        const visitorObject = { 
            visitedSeller: Number(sellerId)
        };
        const res1 = await axios.post("http://localhost:5000/api/post/visitor/seller", visitorObject);
        set
      } catch (error) {
        console.log(error)
      }
    }

    useEffect(() => {
        if (itemId && sellerId) {
            console.warn("Both itemId and sellerId provided. Aborting to prevent conflict.");
            return;
        }
        if (itemId) {
            saveItemVisit();
        } else if (sellerId) {
            saveSellerVisit();
        }
    }, [itemId, sellerId]);

    return (
        <div></div>
    )
}

export default BtmVisitor