import {useState, useRef} from 'react';
import axios from "axios";
import "../styles/Comment.css";

function Comment({ commentReceiver, refreshComments }) {
    const isSaving = useRef(false);  // flag to prevent repetitive requests and duplicates
    const [isSavingButton, setIsSavingButton] = useState(false); //used to display dynamic text in saving button

    const [textComment, setTextComment] = useState("");
    const [commentorName, setCommentorName] = useState("");
    const [errorText, setErrorText] = useState("");

    const escapeHtml = str => str.replace(/[<>]/g, t => t === '<' ? '&lt;' : '&gt;');

    const saveComment = async () => {
        const token = localStorage.getItem("token_livorent");
        const visitorNumber = localStorage.getItem("visitorNumber");

        if (!token || !visitorNumber) {
            setErrorText("Jūs neesat pilnvarots komentēt.");
            return;
        }
 
        //trim the white space and prevent script attacks from inputs
        const trimmedTextComment = textComment.trim();
        const trimmedName = commentorName.trim();
        const safeComment = escapeHtml(trimmedTextComment);
        const safeName = escapeHtml(trimmedName);

        if (trimmedTextComment.length < 10 || trimmedTextComment.length > 800) {
            setErrorText("Komentārs ir pārāk īss vai pārāk garš");
            return;
        }
        if (trimmedName.length < 3 || trimmedName.length > 40 ) {
            setErrorText("Vārds ir pārāk īss vai pārāk garš");
            return;
        }
        // prevent duplicates
        if (isSaving.current) return; 
        isSaving.current = true;
        setIsSavingButton(true);
        try {
            const commentObject = {
                commentText: safeComment,
                commentToken: token,
                commentUserNum: visitorNumber,
                commentReceiverNum: commentReceiver,
                commentName: safeName,
            };
            const res1 = await axios.post("http://localhost:5000/api/post/save-comment", commentObject, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setTextComment(res1?.data?.resMessage);
            refreshComments();
        } catch (error) { 
            const code = error.response?.data?.resErrorCode; //"response" is a keyword/field name of error object.
            if (code === 1) {
                setErrorText("Datubāzes kļūda, lūdzu, mēģiniet vēlreiz vēlāk.");
            } else if (code === 2) {
                setErrorText("Komentārs vai vārds ir tukšs.");
            } else if (code === 3) {
                setErrorText("Komentāram jābūt no 4 līdz 3000 rakstzīmēm.");
            } else if (code === 4) {
                setErrorText("Vārdam jābūt no 4 līdz 100 rakstzīmēm.");
            } else if (code === 5) {
                setErrorText("Nederīgs lietotāja ID.");
            } else if (code === 6) {
                setErrorText("Nederīgs saņēmēja ID.");
            } else {
                setErrorText("Nezināma kļūda.");
            }
            console.log(error);
        } finally {
            isSaving.current = false;
            setIsSavingButton(false);
            setTextComment("");
            setCommentorName("");
        }
    };


    return (
        <div>
            <div className='commentArea'>
                <input className='commentInputName' type='text' placeholder='vārds' value={commentorName}
                    onChange={ (e) => setCommentorName(e.target.value)}/>
                <textarea  className='commentInputText' placeholder="Komentārs vai jautājums"
                    onChange={ (e) => setTextComment(e.target.value)} value={textComment} />
                <button className='commentSaveBtn' onClick={saveComment} disabled={isSaving} >
                    {isSavingButton ? "Saglabā..." : "Saglabāt"}
                </button>
                {errorText && <div className="commentError">{errorText}</div>}
            </div>
        </div>
    )
}

export default Comment