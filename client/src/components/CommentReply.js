import {useState, useRef} from 'react';
import axios from "axios";
import "../styles/CommentReply.css";


function CommentReply({ commentReceiver, cancelReply, parentId, refreshReplies }) {
    const isSaving = useRef(false);  // flag to prevent repetitive requests and duplicates

    const [inputName, setInputName] = useState("");
    const [inputReply, setInputReply] = useState("");
    const [errorText, setErrorText] = useState("");

    const saveReply = async () => {
        const token = localStorage.getItem("token_livorent");
        const visitorNumber = localStorage.getItem("visitorNumber");

        if (!token || !visitorNumber) {
            setErrorText("Jūs neesat pilnvarots komentēt.");
            return;
        }
  
        const trimmedReply = inputReply.trim();
        const trimmedName = inputName.trim();
        if (trimmedReply.length < 4 || trimmedReply.length > 300) {
            setErrorText("Atbilde ir pārāk īsa vai pārāk gara");
            return;
        }
        if (trimmedName.length < 4 || trimmedName.length > 100 ) {
            setErrorText("Vārds ir pārāk īss vai pārāk garš");
            return;
        }

        // prevent duplicates
        if (isSaving.current) return; 
        isSaving.current = true;
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
                setErrorText("Neizdevās savienoties ar datubāzi.");
            } else if (code === 2) {
                setErrorText("Atbilde vai vārds ir tukšs.");
            } else if (code === 3) {
                setErrorText("Atbildei jābūt no 4 līdz 300 rakstzīmēm.");
            } else if (code === 4) {
                setErrorText("Vārdam jābūt no 4 līdz 100 rakstzīmēm.");
            } else if (code === 5) {
                setErrorText("Nederīgs lietotāja ID.");
            } else if (code === 6) {
                setErrorText("Nederīgs saņēmēja ID.");
            } else {
                setErrorText("Nezināma kļūda.");
            }
        } finally {
            isSaving.current = false;
        }
    };

    return ( 
        <div>
            <div className='replyArea'>
                <input className='replyInputName' type='text' placeholder='vārds' value={inputName}
                    onChange={ (e) => setInputName(e.target.value)}/>
                <textarea  className='replyInputText' placeholder="Atbilde" value={inputReply}
                    onChange={ (e) => setInputReply(e.target.value)}/>
                <div>
                    <button className='replyButtonChild' onClick={saveReply} disabled={isSaving.current} >
                        {isSaving.current ? "Saglabā..." : "Saglabāt"}
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