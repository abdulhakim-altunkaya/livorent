import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/CommentDisplay.css";
import CommentReply from "./CommentReply";
import Comment from "./Comment.js";

function ReviewDisplay({ commentReceiver }) {

    const [comments, setComments] = useState([]);
    const [replies, setReplies] = useState([]);
    const [repliedCommentId, setRepliedCommentId] = useState(null);
    const [errorText, setErrorText] = useState("");

    const getData = async () => { 
        try {
            const response = await axios.get(`http://localhost:5000/api/get/comments/${commentReceiver}`);
            const fetchedComments = Array.isArray(response.data.resData) ? response.data.resData : [];
            setComments(fetchedComments);
            const fetchedReplies = fetchedComments.filter(comment => comment.parent !== null);
            setReplies(fetchedReplies);
            console.log("raw data :", response.data.resData);
            console.log("fetchedComments:", fetchedComments);  // already correct
            console.log("fetchedReplies:", fetchedReplies);
        } catch (error) {
            console.log(error.message);
            const code = error?.response?.data?.resErrorCode;
            if (code === 1) {
                setErrorText("Ad ID is missing or invalid.");
            } else if (code === 2) {
                console.log("No comments yet.");
            } else if (code === 3) {
                console.log("Failed to connect to the database.");
            } else {
                console.log("An unknown error occurred.");
            }
        } 
    }

    useEffect(() => {
        getData();
    }, [commentReceiver]);

    const handleReply = (num) => {
      setRepliedCommentId(num);
    }

    const cancelReply = () => {
      setRepliedCommentId(null);
    }

    return (
        <div> 
            
            <div className='commentDisplayArea'>
                {comments.filter(comment => comment.parent === null).map( (com, index) => (

                    <div key={index} className="commentItem">
                            <div className='commentTop'>
                                <span className='commentorName'>{com.commentor_name}</span>
                                <span className='commentDate'>{com.date}</span>
                            </div>
                            <div className='commentText'>
                                {com.comment}
                            </div>
                            {replies.length > 0 ? 
                                replies.filter(myReply1 => myReply1.parent === com.id).map( (myReply, index) => (
                                    <div key={index} className='replyCommentContainer'>
                                        <strong><span>{myReply.commentor_name}</span></strong>&nbsp;
                                        <span>({myReply.date}):</span>&nbsp;
                                        <span>{myReply.comment}</span>
                                    </div>
                                ))
                            : 
                             <div></div>
                            }
                            { repliedCommentId === com.id ? 
                                < CommentReply 
                                    commentReceiver={commentReceiver} 
                                    cancelReply={cancelReply} 
                                    parentId={com.id} 
                                    refreshReplies={getData}
                                />
                            :
                                <div className='replyButtonArea'>
                                    <button className="replyButton" onClick={() => handleReply(com.id)}>Atbildēt</button>
                                </div>
                            }
                            
                    </div>
                ))}
                {errorText && <div className="commentError">{errorText}</div>}
            </div>

            <div> <Comment commentReceiver={commentReceiver} refreshComments={getData} /></div>
        </div>
    )
}

export default ReviewDisplay;