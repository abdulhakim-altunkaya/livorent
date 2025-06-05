import {useState} from 'react';
import axios from "axios";
import "../styles/Comment.css";

function Comment() {
    const [textComment, setTextComment] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const saveComment = async () => {
        if (textComment.length > 3000 || textComment.length < 4) {
            alert("comment is too short or too long");
            return;
        }
        setIsSaving(true);
        try {
            const commentObject = {
                userComment : textComment,
            }
            // Replace with your API endpoint
            await axios.post('http://localhost:5000/api/post/save-comment', commentObject);
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
                <textArea  className='commentInputText' type='text' placeholder="Comment or Question"
                    onChange={ (e) => setTextComment(e.target.value)} value={textComment} />
                <button className='commentSaveBtn' onClick={saveComment} disabled={isSaving} >
                    {isSaving ? "Saglabā..." : "Saglabāt"}
                </button>
            </div>
        </div>
    )
}

export default Comment