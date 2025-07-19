import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminPanel = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingStories, setPendingStories] = useState([]);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/admin/pending-users', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setPendingUsers(res.data));
    axios.get('http://localhost:5000/api/admin/pending-stories', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setPendingStories(res.data));
    axios.get('http://localhost:5000/api/admin/reports', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setReports(res.data));
  }, []);

  const handleVerifyUser = (id) => {
    const token = localStorage.getItem('token');
    axios.post(`http://localhost:5000/api/admin/verify-user/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setPendingUsers(pendingUsers.filter(u => u._id !== id)));
  };

  const handleApproveStory = (id) => {
    const token = localStorage.getItem('token');
    axios.post(`http://localhost:5000/api/admin/approve-story/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
      .then(() => setPendingStories(pendingStories.filter(s => s._id !== id)));
  };

  // Podobnie dla odrzucania, usuwania raportów

  return (
    <div className="container mt-4">
      <h2>Oczekujący użytkownicy</h2>
      {pendingUsers.map(user => (
        <div key={user._id} className="card mb-2">
          <div className="card-body">
            <p>{user.email} - {user.profession}</p>
            <button onClick={() => handleVerifyUser(user._id)} className="btn btn-primary">Zweryfikuj</button>
          </div>
        </div>
      ))}
      <h2>Oczekujące historie</h2>
      {pendingStories.map(story => (
        <div key={story._id} className="card mb-2">
          <div className="card-body">
            <p>{story.content.slice(0, 100)}...</p>
            <button onClick={() => handleApproveStory(story._id)} className="btn btn-primary">Akceptuj</button>
          </div>
        </div>
      ))}
      <h2>Zgłoszenia</h2>
      {reports.map(report => (
        <div key={report._id} className="card mb-2">
          <div className="card-body">
            <p>{report.description}</p>
            {/* Przyciski do obsługi */}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;
