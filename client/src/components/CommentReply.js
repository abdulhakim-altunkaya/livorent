import {useState} from 'react';
import axios from "axios";
import "../styles/CommentReply.css";


function CommentReply({ commentReceiver, cancelReply, parentId, refreshReplies }) {
    const [inputName, setInputName] = useState("");
    const [inputReply, setInputReply] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [errorText, setErrorText] = useState("");
    

    const saveReply = async () => {
        if (isSaving) return; //prevent double submissions
        
        const token = localStorage.getItem("token_livorent");
        const visitorNumber = localStorage.getItem("visitorNumber");

        if (!token || !visitorNumber) {
            alert("You are not authorized to reply.");
            return;
        }
  
        const trimmedReply = inputReply.trim();
        const trimmedName = inputName.trim();
        if (trimmedReply.length < 4 || trimmedReply.length > 300) {
            alert("Reply is too short or too long");
            return;
        }
        if (trimmedName.length < 4 || trimmedName.length > 100 ) {
            alert("Name is too short or too long");
            return;
        }

        setIsSaving(true);
        try {
            const replyObject = {
                replyText: trimmedReply,
                replyToken: token,
                replierNum: visitorNumber,
                replyReceiverNum: commentReceiver, //the item which receives comments and replies
                replierName: trimmedName,
                repliedCommentId: parentId //the comment which receives the reply
            };
            const res1 = await axios.post("http://localhost:5000/api/post/save-reply", replyObject, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setInputReply(res1.data.resMessage); 
            cancelReply();
            refreshReplies();
        } catch (error) {
            console.error('Error:', error);
            const code = error?.response?.data?.resErrorCode;
            if (code === 1) {
                setErrorText("Failed to connect to the database.");
            } else if (code === 2) {
                setErrorText("Reply or name is empty.");
            } else if (code === 3) {
                setErrorText("Reply must be between 4 and 300 characters.");
            } else if (code === 4) {
                setErrorText("Name must be between 4 and 100 characters.");
            } else if (code === 5) {
                setErrorText("Invalid user ID.");
            } else if (code === 6) {
                setErrorText("Invalid receiver ID.");
            } else {
                setErrorText("An unknown error occurred.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    return ( 
        <div>
            <div className='replyArea'>
                <input className='replyInputName' type='text' placeholder='vārds' value={inputName}
                    onChange={ (e) => setInputName(e.target.value)}/>
                <textarea  className='replyInputText' placeholder="Comment or Question" value={inputReply}
                    onChange={ (e) => setInputReply(e.target.value)}/>
                <div>
                    <button className='replyButtonChild' onClick={saveReply} disabled={isSaving} >
                        {isSaving ? "Saglabā..." : "Saglabāt"}
                    </button> &nbsp;&nbsp;&nbsp;
                    <button className='replyButtonChild' onClick={cancelReply} >
                        Atcelt
                    </button>
                </div>
                {errorText && <div className="commentError">{errorText}</div>}
   
            </div>
        </div>
    )
}

export default CommentReply