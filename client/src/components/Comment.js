import {useState} from 'react';
import axios from "axios";
import "../styles/Comment.css";

function Comment({ commentReceiver }) {
    const [textComment, setTextComment] = useState("");
    const [commentorName, setCommentorName] = useState("") 
    const [isSaving, setIsSaving] = useState(false);

    const saveComment = async () => {
        const token = localStorage.getItem("token_livorent");
        const visitorNumber = localStorage.getItem("visitorNumber");

        if (!token || !visitorNumber) {
            alert("You are not authorized to comment.");
            return;
        }
 
        const trimmedTextComment = textComment.trim();
        const trimmedName = commentorName.trim();
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
                commentText: trimmedTextComment,
                commentToken: token,
                commentUserNum: visitorNumber,
                commentReceiverNum: commentReceiver,
                commentName: trimmedName,
            };
            const res1 = await axios.post("http://localhost:5000/api/post/save-comment", commentObject, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setTextComment(res1.data.resMessage);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save comment.');
        } finally {
            setIsSaving(false);
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
            </div>
        </div>
    )
}

export default Comment