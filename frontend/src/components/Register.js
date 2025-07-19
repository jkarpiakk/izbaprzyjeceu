import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profession, setProfession] = useState('lekarz');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/register', { email, password, profession })
      .then(() => {
        alert('Zarejestrowano, czekaj na weryfikację');
        navigate('/login');
      })
      .catch(err => alert('Błąd rejestracji'));
  };

  return (
    <div className="container mt-5">
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Email</label>
          <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Hasło</label>
          <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Zawód</label>
          <select className="form-control" value={profession} onChange={e => setProfession(e.target.value)}>
            <option value="lekarz">Lekarz</option>
            <option value="pielęgniarka">Pielęgniarka</option>
            <option value="ratownik">Ratownik</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary">Zarejestruj się</button>
      </form>
    </div>
  );
};

export default Register;
