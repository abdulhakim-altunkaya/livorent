import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/CommentDisplay.css";

function CommentDisplay({ commentReceiver }) {

    const [comments, setComments] = useState([]);
    const [replies, setReplies] = useState([]);
    const [testArea, setTestArea] = useState("random text from comment display")
    useEffect(() => {
      const getData = async () => { 
        try {
            const response = await axios.get(`http://localhost:5000/api/get/comments/${commentReceiver}`);
             const fetchedComments = Array.isArray(response.data.resData) ? response.data.resData : [];
            setComments(fetchedComments);
            const fetchedReplies = fetchedComments.filter(comment => comment.parent !== null);
            setReplies(fetchedReplies);
            console.log(comments)
        } catch (error) {
            console.log(error.message);  
        } 
      }
      getData();
    }, [])

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
                        <div className='replyButtonArea'>
                            <button className="replyButton">Reply</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CommentDisplay