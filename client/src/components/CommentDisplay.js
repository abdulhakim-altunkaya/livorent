import {useEffect} from 'react';

function CommentDisplay() {

    const [comments, setComments] = useState([]);
    const [replies, setReplies] = useState([]);

    useEffect(() => {
      const getData = async () => {
        try {
            const response = await axios.get("/api/get/comments");
            const fetchedComments = Array.isArray(response.data) ? response.data : [];
            setComments(fetchedComments);
            const replies = fetchedComments.filter(comment => comment.parent_id !== null);
            setReplies(replies);
        } catch (error) {
            console.log(error.message);  
        } 
      }
      getData();
    }, [])
    

    return (
        <div>
            <div className='commentDisplayArea'>
                <div className='commentTop'>
                    <span className='commentName'></span>
                    <span className='commentDate'></span>
                </div>
                <div className='commentText'>

                </div>
                <div className='commentButton'>

                </div>
            </div>
        </div>
    )
}

export default CommentDisplay