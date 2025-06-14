import {useState} from 'react';
import axios from "axios";
import "../styles/Comment.css";

function Review({ reviewReceiver, refreshReviews }) {
    const [textReview, setTextReview] = useState("");
    const [reviewerName, setReviewerName] = useState("") 
    const [isSaving, setIsSaving] = useState(false);
    const [errorText, setErrorText] = useState("");

    const escapeHtml = str => str.replace(/[<>]/g, t => t === '<' ? '&lt;' : '&gt;');

    const saveReview = async () => {
        if (isSaving) return; //prevent double submissions

        const token = localStorage.getItem("token_livorent");
        const visitorNumber = localStorage.getItem("visitorNumber");

        if (!token || !visitorNumber) {
            alert("You are not authorized to review.");
            return;
        }
 
        //trim the white space and prevent script attacks from inputs
        const trimmedTextReview = textReview.trim();
        const trimmedName = reviewerName.trim();
        const safeReview = escapeHtml(trimmedTextReview);
        const safeName = escapeHtml(trimmedName);

        if (trimmedTextReview.length < 4 || trimmedTextReview.length > 3000) {
            alert("Review is too short or too long");
            return;
        }
        if (trimmedName.length < 3 || trimmedName.length > 100 ) {
            alert("Name is too short or too long");
            return;
        }

        setIsSaving(true);
        try {
            const reviewObject = {
                reviewText: safeReview,
                reviewToken: token,
                reviewUserNum: visitorNumber,
                reviewReceiverNum: reviewReceiver,
                reviewerName: safeName,
            };
            const res1 = await axios.post("http://localhost:5000/api/post/save-comment", reviewObject, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setTextReview(res1?.data?.resMessage);
            refreshReviews();
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
            } else {
                setErrorText("Unknown error occurred.");
            }
            console.log(error);
        } finally {
            setIsSaving(false);
            setTextReview("");
            setReviewerName("");
        }
    };


    return (
        <div>
            <div className='commentArea'>
                <input className='commentInputName' type='text' placeholder='vārds' value={reviewerName}
                    onChange={ (e) => setReviewerName(e.target.value)}/>
                <textarea  className='commentInputText' placeholder="Review"
                    onChange={ (e) => setTextReview(e.target.value)} value={textReview} />
                <button className='commentSaveBtn' onClick={saveReview} disabled={isSaving} >
                    {isSaving ? "Saglabā..." : "Saglabāt"}
                </button>
                {errorText && <div className="commentError">{errorText}</div>}
            </div>
        </div>
    )
}

export default Review