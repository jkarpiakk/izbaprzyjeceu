import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddStory = () => {
  const [content, setContent] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [location, setLocation] = useState('SOR');
  const [type, setType] = useState('własne doświadczenie');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    axios.post('http://localhost:5000/api/stories', { content, specialization, location, type }, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => {
        alert('Historia wysłana do moderacji');
        navigate('/');
      });
  };

  return (
    <div className="container mt-5">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Treść</label>
          <textarea className="form-control" value={content} onChange={e => setContent(e.target.value)} required></textarea>
        </div>
        <div className="mb-3">
          <label>Specjalizacja</label>
          <input type="text" className="form-control" value={specialization} onChange={e => setSpecialization(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Miejsce</label>
          <select className="form-control" value={location} onChange={e => setLocation(e.target.value)}>
            <option value="SOR">SOR</option>
            <option value="Oddział szpitalny">Oddział szpitalny</option>
            <option value="Przychodnia POZ">Przychodnia POZ</option>
          </select>
        </div>
        <div className="mb-3">
          <label>Typ</label>
          <select className="form-control" value={type} onChange={e => setType(e.target.value)}>
            <option value="własne doświadczenie">Własne doświadczenie</option>
            <option value="zasłyszane">Zasłyszane</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Wyślij</button>
      </form>
    </div>
  );
};

export default AddStory;
