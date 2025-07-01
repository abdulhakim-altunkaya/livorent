import {useState, useRef} from 'react';
import axios from "axios";
import "../styles/Comment.css";

function Review({ reviewReceiver, refreshReplies }) {
    const isSaving = useRef(false);  // flag to prevent repetitive requests and duplicates

    const [textReview, setTextReview] = useState("");
    const [reviewerName, setReviewerName] = useState("") 
    const [errorText, setErrorText] = useState("");
    const [selectedRating, setSelectedRating] = useState(null);

    const escapeHtml = str => str.replace(/[<>]/g, t => t === '<' ? '&lt;' : '&gt;');

    const saveReview = async () => {
        const token = localStorage.getItem("token_livorent");
        const visitorNumber = localStorage.getItem("visitorNumber");

        if (!token || !visitorNumber) {
            alert("You are not authorized to review.");
            return;
        }
        if (selectedRating < 1 || selectedRating > 10 || selectedRating === null) {
            alert("Choose rating score from 1 to 10");
            return;
        }
 
        //trim the white space and prevent script attacks from inputs
        const trimmedTextReview = textReview.trim();
        const trimmedName = reviewerName.trim();
        const safeReview = escapeHtml(trimmedTextReview);
        const safeName = escapeHtml(trimmedName);

        if (trimmedTextReview.length < 10 || trimmedTextReview.length > 800) {
            alert("Review is too short or too long");
            return;
        }
        if (trimmedName.length < 3 || trimmedName.length > 40 ) {
            alert("Name is too short or too long");
            return;
        }

        // prevent duplicates
        if (isSaving.current) return; 
        isSaving.current = true;
        try {
            const reviewObject = {
                reviewText: safeReview,
                reviewToken: token,
                reviewUserNum: visitorNumber,
                reviewReceiverNum: reviewReceiver,
                reviewerName: safeName,
                reviewRating: selectedRating
            };
            const res1 = await axios.post("http://localhost:5000/api/post/save-review", reviewObject, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setTextReview(res1?.data?.resMessage);
            refreshReplies();
        } catch (error) {
            const code = error.response?.data?.resErrorCode; //"response" is a keyword/field name of error object.
            if (code === 1) {
                setErrorText("Database error, please try again later.");
            } else if (code === 2) {
                setErrorText("Review or name is empty.");
            } else if (code === 3) {
                setErrorText("Review must be between 4 and 3000 characters.");
            } else if (code === 4) {
                setErrorText("Name must be between 4 and 100 characters.");
            } else if (code === 5) {
                setErrorText("Invalid user ID.");
            } else if (code === 6) {
                setErrorText("Invalid receiver ID.");
            } else if (code === 7) {
                setErrorText("Did you choose review score?");
            } else {
                setErrorText("Unknown error occurred.");
            }
            console.log(error);
        } finally {
            isSaving.current = false;
            setTextReview("");
            setReviewerName("");
        }
    };
    

    const handleSelect = (value) => {
        setSelectedRating(value);
    };

    return (
        <div>
            <div className='commentArea'>
                <div className='reviewButtonContainer'>
                    Rating:
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <button
                            key={num}
                            onClick={() => handleSelect(num)}
                            className={`reviewRatingButtons ${selectedRating === num ? 'selected' : ''}`}
                            >
                            {num}
                        </button>
                    ))}
                </div>
                <input className='commentInputName' type='text' placeholder='vārds' value={reviewerName}
                    onChange={ (e) => setReviewerName(e.target.value)}/>
                <textarea  className='commentInputText' placeholder="Review"
                    onChange={ (e) => setTextReview(e.target.value)} value={textReview} />
                <button className='commentSaveBtn' onClick={saveReview} disabled={isSaving.current} >
                    {isSaving.current ? "Saglabā..." : "Saglabāt"}
                </button>
                {errorText && <div className="commentError">{errorText}</div>}
            </div>
        </div>
    )
}

export default Review