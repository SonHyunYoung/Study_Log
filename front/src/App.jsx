import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Main from './pages/Main';
import ProblemList from './pages/ProblemList';
import IncorrectNote from './pages/IncorrectNote';

import './App.css'; 

function App() {
  return (
    <Router>
      <div className="app-container"> 
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/main" element={<Main />} />
          <Route path="/register" element={<Register />} />
          <Route path="/problems" element={<ProblemList />} />
          <Route path="/incorrect" element={<IncorrectNote />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;