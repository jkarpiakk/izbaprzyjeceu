import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Feed = () => {
  const [stories, setStories] = useState([]);
  const [filters, setFilters] = useState({ sort: 'latest' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return window.location.href = '/login';
    axios.get('http://localhost:5000/api/stories', { 
      params: filters, 
      headers: { Authorization: `Bearer ${token}` } 
    })
      .then(res => setStories(res.data))
      .catch(err => console.error(err));
  }, [filters]);

  const handleReact = (id, type) => {
    const token = localStorage.getItem('token');
    axios.post(`http://localhost:5000/api/stories/${id}/react`, { type }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      // Update local state if needed
      setStories(stories.map(s => s._id === id ? { ...s, reactions: { ...s.reactions, [type]: s.reactions[type] + 1 } } : s));
    });
  };

  return (
    <div className="container mt-4">
      {/* Filtry - dodaj selecty */}
      <div className="mb-3">
        <label>Sortuj</label>
        <select onChange={e => setFilters({...filters, sort: e.target.value})}>
          <option value="latest">Najnowsze</option>
          <option value="best">Najlepsze</option>
        </select>
        {/* Dodaj filtry dla specjalizacji, miejsca, typu */}
      </div>
      <div className="row">
        {stories.map(story => (
          <div key={story._id} className="col-md-4">
            <div className="card">
              <div className="card-body">
                <h5>{story.specialization} - {story.location} ({story.type})</h5>
                <p>{story.content.slice(0, 200)}...</p>
                <p>{story.author} - {new Date(story.date).toLocaleDateString()}</p>
                <div>
                  <button onClick={() => handleReact(story._id, 'funny')}>😄 {story.reactions.funny}</button>
                  <button onClick={() => handleReact(story._id, 'shocking')}>😲 {story.reactions.shocking}</button>
                  <button onClick={() => handleReact(story._id, 'embarrassing')}>🤦 {story.reactions.embarrassing}</button>
                </div>
                <Link to={`/story/${story._id}`} className="btn btn-primary mt-2">Czytaj więcej</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
