import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Main from './pages/Main';
import './App.css'; 

function App() {
  return (
    <Router>
      <div className="login-screen">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path='/main' element={<Main />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;