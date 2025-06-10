import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/CommentDisplay.css";
import CommentReply from "./CommentReply";

function CommentDisplay({ commentReceiver }) {

    const [comments, setComments] = useState([]);
    const [replies, setReplies] = useState([]);
    const [testArea, setTestArea] = useState("random text from comment display");
    const [repliedCommentId, setRepliedCommentId] = useState(null);

    useEffect(() => {
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
        } 
      }
      getData();
    }, []);    

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
                                replies.map( (myReply, index) => (
                                    <div key={index}>
                                        <span>{myReply.commentor_name}</span>
                                        <span>{myReply.date}</span>
                                        <span>{myReply.comment}</span>
                                    </div>
                                ))
                            :
                             <div></div>
                            }
                            { repliedCommentId === com.id ? 
                                < CommentReply commentReceiver={commentReceiver} cancelReply={cancelReply} parentId={com.id} />
                            :
                                <div className='replyButtonArea'>
                                    <button className="replyButton" onClick={() => handleReply(com.id)}>Atbildēt</button>
                                </div>
                            }
                            
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CommentDisplay