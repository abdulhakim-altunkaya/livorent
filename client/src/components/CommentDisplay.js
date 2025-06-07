import { useState, useEffect } from "react";
import axios from "axios";

function CommentDisplay({ commentReceiver }) {

    const [comments, setComments] = useState([]);
    const [replies, setReplies] = useState([]);

    useEffect(() => {
      const getData = async () => {
        try {
            const response = await axios.get(`/api/get/comments/${commentReceiver}`);
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

    // log after state updates
    useEffect(() => { console.log(comments); }, [comments]);
    useEffect(() => { console.log(replies);  }, [replies]);
    

    return (
        <div>
            <div className='commentDisplayArea'>
                <div className='commentTop'>
                    <span className='commentName'></span>
                    <span className='commentDate'></span>
                </div>
                <div className='commentText'>
                    random text from comment display
                </div>
                <div className='commentButton'>

                </div>
            </div>
        </div>
    )
}

export default CommentDisplay