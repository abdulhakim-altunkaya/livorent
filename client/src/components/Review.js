import {useState, useRef} from 'react';
import axios from "axios";
import "../styles/Comment.css";

function Review({ reviewReceiver, refreshReplies }) {
    const isSaving = useRef(false);  // flag to prevent repetitive requests and duplicates

    const [textReview, setTextReview] = useState("");
    const [reviewerName, setReviewerName] = useState("") 
    const [errorText, setErrorText] = useState("");
    const [selectedRating, setSelectedRating] = useState(null);
    const [savingButton, setSavingButton] = useState(false);

    const escapeHtml = str => str.replace(/[<>]/g, t => t === '<' ? '&lt;' : '&gt;');

    const saveReview = async () => {
        const token = localStorage.getItem("token_livorent");
        const visitorNumber = localStorage.getItem("visitorNumber");

        if (!token || !visitorNumber) {
            setErrorText("Jūs neesat pilnvarots veikt atsauksmi. ❌");
            return;
        }
        if (selectedRating < 1 || selectedRating > 10 || selectedRating === null) {
            setErrorText("Izvēlieties vērtējumu no 1 līdz 10 ❌");
            return;
        }
 
        //trim the white space and prevent script attacks from inputs
        const trimmedTextReview = textReview.trim();
        const trimmedName = reviewerName.trim();
        const safeReview = escapeHtml(trimmedTextReview);
        const safeName = escapeHtml(trimmedName);

        if (trimmedTextReview.length < 10 || trimmedTextReview.length > 600) {
            setErrorText("Atsauksme ir pārāk īsa vai pārāk gara ❌");
            return;
        }
        if (trimmedName.length < 3 || trimmedName.length > 30) {
            setErrorText("Vārds ir pārāk īss vai pārāk garš ❌");
            return;
        }

        // prevent duplicates
        if (isSaving.current) return; 
        isSaving.current = true;
        setSavingButton(true);
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
                setErrorText("Datubāzes kļūda, lūdzu, mēģiniet vēlāk. ❌");
            } else if (code === 2) {
                setErrorText("Atsauksmes vai vārds ir tukšs. ❌");
            } else if (code === 3) {
                setErrorText("Atsauksmei jābūt no 4 līdz 3000 rakstzīmēm. ❌");
            } else if (code === 4) {
                setErrorText("Vārdam jābūt no 4 līdz 100 rakstzīmēm. ❌");
            } else if (code === 5) {
                setErrorText("Nederīgs lietotāja ID. ❌");
            } else if (code === 6) {
                setErrorText("Nederīgs saņēmēja ID. ❌");
            } else if (code === 7) {
                setErrorText("Vai izvēlējāties atsauksmes vērtējumu? ❌");
            } else if (code === 11) {
                setErrorText("Lūdzu, mēģiniet vēlreiz pēc 2 minūtēm. ❌");
            } else {
                setErrorText("Radās nezināma kļūda. ❌");
            }
            console.log(error);
        } finally {
            isSaving.current = false;
            setTextReview("");
            setReviewerName("");
            setSavingButton(false);
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
                <div className='reviewButtonContainerSmall'>
                    <span className='reviewFormLabels'>Rating:</span><br/>
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
                <textarea  className='commentInputText' placeholder="Atsauksmes"
                    onChange={ (e) => setTextReview(e.target.value)} value={textReview} />
                <button className='commentSaveBtn' onClick={saveReview} disabled={savingButton} >
                    {isSaving.current ? "Saglabā..." : "Saglabāt"}
                </button>
                {errorText && <div className="commentError">{errorText}</div>}
            </div>
        </div>
    )
}

export default Review