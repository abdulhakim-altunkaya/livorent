import {useEffect, useRef } from 'react';
import axios from 'axios';

function BtmVisitor({ sellerId, itemId, itemMainCategory, itemSubCategory }) {

    const isSaving = useRef(false);  // flag to prevent repetitive requests and duplicates
  
    const saveItemVisit = async () => {
      // prevent duplicates
      if (isSaving.current) return; 
      isSaving.current = true;

      try {
        const visitorObject = {  
            visitedItem: Number(itemId),
            visitedMainGroup: Number(itemMainCategory),
            visitedSubGroup: Number(itemSubCategory), 
        };
        const res1 = await axios.post("http://localhost:5000/api/post/visitor/item", visitorObject);
      } catch (error) {
        console.log(error) 
      } finally {
        isSaving.current = false;
      }
    }
    const getItemVisit = async () => {
      try {
        const res1 = await axios.get(`http://localhost:5000/api/get/visits/seller/${itemId}`);
        console.log(res1.data.resVisitCount);
      } catch (error) {
        console.log(error) 
      } finally {
        
      }
    }
    const saveSellerVisit = async () => {
      // prevent duplicates
      if (isSaving.current) return; 
      isSaving.current = true;

      try {
        const visitorObject = { 
            visitedSeller: Number(sellerId)
        };
        const res1 = await axios.post("http://localhost:5000/api/post/visitor/seller", visitorObject);
      } catch (error) {
        console.log(error)
      } finally {
        isSaving.current = false;
      }
    }
    const getSellerVisit = async () => {
      try {
        const res1 = await axios.get(`http://localhost:5000/api/get/visits/item/${sellerId}`);
        console.log(res1.data.resVisitCount);
      } catch (error) {
        console.log(error) 
      } finally {
        
      }
    }
    useEffect(() => {
        if (itemId && sellerId) {
            console.warn("Both itemId and sellerId provided. Aborting to prevent conflict.");
            return;
        }
        if (itemId) {
            saveItemVisit();
            getItemVisit();
        } else if (sellerId) {
            saveSellerVisit();
            getSellerVisit();
        }
    }, [itemId, sellerId]);

    return (
        <div></div>
    )
}

export default BtmVisitor