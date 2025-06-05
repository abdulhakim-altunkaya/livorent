import {useState} from 'react';
import axios from "axios";
import "../styles/Comment.css";

function Comment() {
    const [textComment, setTextComment] = useState("");

    const saveComment = async (e) => {
      setTestArea(textComment)
    }

    return (
        <div>
            <div className='commentArea'>
                <textArea  className='commentInputText' type='text' placeholder="Comment or Question"
                    onChange={ (e) => setTextComment(e.target.value)} value={textComment} />
                <button className='commentSaveBtn' onClick={saveComment}>Save</button>
            </div>
        </div>
    )
}

export default Comment