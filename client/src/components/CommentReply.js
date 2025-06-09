import {useState} from 'react';
import axios from "axios";
import "../styles/CommentReply.css";


function CommentReply({ commentReceiver }) {
    const [inputName, setInputName] = useState("");
    const [inputReply, setInputReply] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const saveReply = async () => {
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
                replyReceiverNum: commentReceiver,
                replierName: trimmedName,
            };
            const res1 = await axios.post("http://localhost:5000/api/post/save-reply", replyObject, {
                headers: {Authorization: `Bearer ${token}`}
            });
            setInputReply(res1.data.resMessage);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to save comment.');
        } finally {
            setIsSaving(false);
        }
    };

    const cancelReply = () => {
      setInputReply("reply cancelled")
    }

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
   
            </div>
        </div>
    )
}

export default CommentReply