import React, {useState } from 'react';
import axios from "axios";
import "../styles/Comment.css";

function CommentReply({commentId2, cancelReply}) {
    const [name, setName] = useState("");
    const [text, setText] = useState("");

    const [commentTitle1, setCommentTitle1] = useState("Name-Surname");
    const [commentTitle2, setCommentTitle2] = useState("Comment");
    const [commentTitle3, setCommentTitle3] = useState("Save")
    const [commentTitle4, setCommentTitle4] = useState("Cancel")
    
    const handleSubmit = async (e) => {
        if (name.length > 30 || text.length > 300) {
            alert("Name area too long");
            return;
        }
        if(name.length < 5 || text.length < 5) {
            alert("Name area too short");
            return;
        }
        e.preventDefault();
        if (name && text) {
            const date = new Date().toLocaleDateString('en-GB');
            const newComment = {
                name,
                text,
                date,
                commentId: Number(commentId2)
            }
            try {
                const response = await axios.post("/serversavecommentreply", newComment)
                alert(response.data.message);
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    alert("Please wait for new comment");
                } else {
                    alert("Error while saving the comment. Please try again later.");
                } 
            } finally {
                setName("");
                setText("");
            }
        } else {
            alert("Please fill out all areas");
        } 
    }

    return ( 
        <div className="commentReplyFormContainer">
            <form className="commentReplyForm" onSubmit={handleSubmit}> 
                <div className="commentReplyFormParts">
                    <input type='text' id='name' required maxLength={30} 
                        value={name} placeholder={commentTitle1}
                        onChange={ (e) => setName(e.target.value)} aria-label={commentTitle1} />
                </div>
                <div className="commentReplyFormParts">
                    <textarea type='text' id='text' required maxLength={300}
                        value={text} placeholder={commentTitle2}
                        onChange={ (e) => setText(e.target.value)} aria-label={commentTitle2} > 
                    </textarea>
                </div>
                <div className='commentReplyFormButtonsDiv'>
                    <button type='submit' aria-label={commentTitle3}>{commentTitle3}</button>
                    <button aria-label={commentTitle3} onClick={cancelReply}>{commentTitle4}</button>
                </div>

            </form>
        </div>
    )
}

export default CommentReply;
