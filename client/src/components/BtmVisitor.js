import {useEffect, useRef } from 'react';
import axios from 'axios';

function BtmVisitor({ sellerId, itemId, itemMainCategory, itemSubCategory }) {

    const isSaving = useRef(false);  // flag to track request state
  
    const saveItemVisit = async () => {
      // prevent duplicate
      if (isSaving.current) return; 
      isSaving.current = true;

      try {
        const visitorObject = { 
            visitedSeller: Number(sellerId),
            visitedMainGroup: itemMainCategory,
            visitedSubGroup: itemSubCategory, 
        };
        const res1 = await axios.post("http://localhost:5000/api/post/save-like-item", visitorObject);
      } catch (error) {
        console.log(error)
      } finally {
        isSaving.current = false;
      }
    }

    const saveSellerVisit = async () => {
      try {
        const visitorObject = { 
            visitedSeller: Number(sellerId)
        };
        const res1 = await axios.post("http://localhost:5000/api/post/visitor/seller", visitorObject);
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