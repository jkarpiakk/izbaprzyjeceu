import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Feed from './components/Feed';
import StoryDetail from './components/StoryDetail';
import AddStory from './components/AddStory';
import AdminPanel from './components/AdminPanel';
import Terms from './components/Terms';
import About from './components/About';
import Navbar from './components/Navbar';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Feed />} />
        <Route path="/story/:id" element={<StoryDetail />} />
        <Route path="/add-story" element={<AddStory />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
