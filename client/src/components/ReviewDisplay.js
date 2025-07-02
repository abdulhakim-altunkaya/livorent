import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/CommentDisplay.css";
import ReviewReply from "./ReviewReply.js";
import Review from "./Review.js";

function ReviewDisplay({ reviewReceiver, handleRating, handleRaters }) {

    const [reviews, setReviews] = useState([]);
    const [replies, setReplies] = useState([]);
    const [repliedReviewId, setRepliedReviewId] = useState(null);
    const [errorText, setErrorText] = useState("");

    const getData = async () => { 
        try {
            const response = await axios.get(`http://localhost:5000/api/get/reviews/${reviewReceiver}`);
            const fetchedReviews = Array.isArray(response.data.resData) ? response.data.resData : [];
            setReviews(fetchedReviews);
            const fetchedReplies = fetchedReviews.filter(rew => rew.parent !== null);
            setReplies(fetchedReplies);

            // FINDING AVERAGE OF RATINGS: Filter out replies (optional, if only top-level reviews should be counted)
            const fetchedRatings = fetchedReviews.filter(r => r.parent === null).map(r => Number(r.rating));
            let totalRating = 0;
            for (let i = 0; i < fetchedRatings.length; i++) {
                totalRating += fetchedRatings[i];
            }
            let averageRating = (totalRating/fetchedRatings.length).toFixed(1);
            handleRating(averageRating);
            handleRaters(fetchedRatings.length);
            
        } catch (error) {
            console.log(error.message);
            const code = error?.response?.data?.resErrorCode;
            if (code === 1) {
                setErrorText("Sludinājuma ID trūkst vai ir nederīgs.");
            } else if (code === 2) {
                console.log("Atsauksmju vēl nav.");
            } else if (code === 3) {
                console.log("Neizdevās izveidot savienojumu ar datubāzi.");
            } else {
                console.log("Radās nezināma kļūda.");
            }
        } 
    }

    useEffect(() => {
        getData();
    }, [reviewReceiver]);

    const handleReply = (num) => {
      setRepliedReviewId(num);
    }

    const cancelReply = () => {
      setRepliedReviewId(null);
    }

    return (
        <div> 
            
            <div className='commentDisplayArea'>
                {reviews.filter(review => review.parent === null).map( (rew, index) => (

                    <div key={index} className="commentItem">
                            <div className='commentTop'>
                                <span className='commentorName'>
                                    
                                    <span className="ratingNum">{rew.rating}.0</span>
                                    <span>{rew.reviewer_name}</span>
                                </span>
                                <span className='commentDate'>{rew.date}</span>
                            </div>
                            <div className='commentText'>
                                {rew.review_text}
                            </div>
                            {replies.length > 0 ? 
                                replies.filter(myReply1 => myReply1.parent === rew.id).map( (myReply, index) => (
                                    <div key={index} className='replyCommentContainer'>
                                        <strong><span>{myReply.reviewer_name}</span></strong>&nbsp;
                                        <span>({myReply.date}):</span>&nbsp;
                                        <span>{myReply.review_text}</span>
                                    </div>
                                ))
                            : 
                             <div></div>
                            }
                            { repliedReviewId === rew.id ? 
                                < ReviewReply 
                                    reviewReceiver={reviewReceiver} 
                                    cancelReply={cancelReply} 
                                    parentId={rew.id} 
                                    refreshReplies={getData} 
                                />
                            :
                                <div className='replyButtonArea'>
                                    <button className="replyButton" onClick={() => handleReply(rew.id)}>Atbildēt</button>
                                </div>
                            }
                            
                    </div>
                ))}
                {errorText && <div className="commentError">{errorText}</div>}
            </div>

            <div> <Review reviewReceiver={reviewReceiver} refreshReplies={getData} /></div>
        </div>
    )
}

export default ReviewDisplay;