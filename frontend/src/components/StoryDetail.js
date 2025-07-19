import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const StoryDetail = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`http://localhost:5000/api/stories/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setStory(res.data));
    axios.get(`http://localhost:5000/api/comments/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setComments(res.data));
  }, [id]);

  const handleAddComment = () => {
    const token = localStorage.getItem('token');
    axios.post('http://localhost:5000/api/comments', { content: newComment, story: id }, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setComments([...comments, res.data]));
    setNewComment('');
  };

  if (!story) return <div>Ładowanie...</div>;

  return (
    <div className="container mt-4">
      <div className="card">
        <div className="card-body">
          <h2>{story.specialization} - {story.location}</h2>
          <p>{story.content}</p>
          <p>{story.author} - {new Date(story.date).toLocaleDateString()}</p>
          <div>
            {/* Reakcje jak w Feed */}
          </div>
        </div>
      </div>
      <h3>Komentarze</h3>
      {comments.map(c => (
        <div key={c._id} className="card mb-2">
          <div className="card-body">
            <p>{c.content}</p>
            <p>{c.author} - {new Date(c.date).toLocaleDateString()}</p>
          </div>
        </div>
      ))}
      <textarea value={newComment} onChange={e => setNewComment(e.target.value)} className="form-control mb-2"></textarea>
      <button onClick={handleAddComment} className="btn btn-primary">Dodaj komentarz</button>
    </div>
  );
};

export default StoryDetail;
