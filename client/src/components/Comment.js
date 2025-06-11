import {useState} from 'react';
import axios from "axios";
import "../styles/Comment.css";

function Comment({ commentReceiver }) {
    const [textComment, setTextComment] = useState("");
    const [commentorName, setCommentorName] = useState("") 
    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const escapeHtml = str => str.replace(/[<>]/g, t => t === '<' ? '&lt;' : '&gt;');

    const saveComment = async () => {
        if (isSaving) return; //prevent double submissions

        const token = localStorage.getItem("token_livorent");
        const visitorNumber = localStorage.getItem("visitorNumber");

        if (!token || !visitorNumber) {
            alert("You are not authorized to comment.");
            return;
        }
 
        //trim the white space and prevent script attacks from inputs
        const trimmedTextComment = textComment.trim();
        const trimmedName = commentorName.trim();
        const safeComment = escapeHtml(trimmedTextComment);
        const safeName = escapeHtml(trimmedName);

        if (trimmedTextComment.length < 4 || trimmedTextComment.length > 3000) {
            alert("Comment is too short or too long");
            return;
        }
        if (trimmedName.length < 4 || trimmedName.length > 100 ) {
            alert("Name is too short or too long");
            return;
        }

        setIsSaving(true);
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
        } catch (error) {
            const code = error.response?.data?.resErrorCode; //"response" is a keyword/field name of error object.
            if (code === 1) {
                setErrorMsg("Database error, please try again later.");
            } else if (code === 2) {
                setErrorMsg("Comment or name is empty.");
            } else if (code === 3) {
                setErrorMsg("Comment must be between 4 and 3000 characters.");
            } else if (code === 4) {
                setErrorMsg("Name must be between 4 and 100 characters.");
            } else if (code === 5) {
                setErrorMsg("Invalid user ID.");
            } else if (code === 6) {
                setErrorMsg("Invalid receiver ID.");
            } else {
                setErrorMsg("Unknown error occurred.");
            }
            console.log(error);
        } finally {
            setIsSaving(false);
            setTextComment("");
            setCommentorName("");
        }
    };


    return (
        <div>
            <div className='commentArea'>
                <input className='commentInputName' type='text' placeholder='vārds' value={commentorName}
                    onChange={ (e) => setCommentorName(e.target.value)}/>
                <textarea  className='commentInputText' placeholder="Comment or Question"
                    onChange={ (e) => setTextComment(e.target.value)} value={textComment} />
                <button className='commentSaveBtn' onClick={saveComment} disabled={isSaving} >
                    {isSaving ? "Saglabā..." : "Saglabāt"}
                </button>
                {errorMsg && <div className="commentError">{errorMsg}</div>}
            </div>
        </div>
    )
}

export default Comment