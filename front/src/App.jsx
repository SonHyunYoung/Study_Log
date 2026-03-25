import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import './App.css'; // ⭐️ 반드시 이 줄이 있어야 스타일이 적용됩니다!

function App() {
  return (
    <Router>
      <div className="login-screen">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;