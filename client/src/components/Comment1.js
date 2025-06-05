import React, {useState } from 'react';
import axios from "axios";
import "../styles/Comment.css";

function Comment() {
    const [name, setName] = useState("");
    const [text, setText] = useState("");

    const commentTitle1 = "Name - Surname";
    const commentTitle2 = "Comment/Question";
    const commentTitle3 = "Save";

    const handleSubmit = async (e) => {
        if (name.length > 30 || text.length > 300) {
            alert("Name too long");
            return;
        }
        if(name.length < 5 || text.length < 5) {
            alert("Name too short");
            return;
        }
        e.preventDefault();
        if (name && text) {
            const date = new Date().toLocaleDateString('en-GB');
            const newComment = {
                name,
                text,
                date
            } 
            try {
                const response = await axios.post("/serversavecomment", newComment)
                alert(response.data.message);
            } catch (error) {
                if (error.response && error.response.status === 429) {
                    alert("Please wait for new comment.");
                } else {
                    alert("Error while saving the comment. Please try again later.");
                } 
            } finally {
                setName("");
                setText("");
            }
        } else {
            alert("Please fill out all fields");
        } 
    }
    return (
        <div className="comment-container">
            <form className="comment-form" onSubmit={handleSubmit}> 
                <div className="form-group">
                    <input type='text' id='name' required maxLength={30} 
                        value={name} placeholder={commentTitle1}
                        onChange={ (e) => setName(e.target.value)} aria-label="Name Surname" />
                </div>
                <div className="form-group">
                    <textarea type='text' id='text' required maxLength={300}
                        value={text} placeholder={commentTitle2}
                        onChange={ (e) => setText(e.target.value)} aria-label="Comments and questions" > 
                    </textarea>
                </div>
                <button type='submit' aria-label={commentTitle3}>{commentTitle3}</button>
            </form>
        </div>
    )
}

export default Comment;
