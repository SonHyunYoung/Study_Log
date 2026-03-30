import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Main from './pages/Main';
import Problem from './pages/ProblemList';
import Incorrect from './pages/IncorrectNote';
import './App.css'; 

function App() {
  return (
    <Router>
      {/* 전체를 감싸는 div가 있으면 모든 페이지에 배경이 적용될 수 있습니다 */}
      <div className="app-container"> 
        <Routes>
          {/* 루트 경로: 로그인 */}
          <Route path="/" element={<Login />} />
          
          {/* 메인 페이지 */}
          <Route path="/main" element={<Main />} />
          
          {/* 회원가입 페이지 */}
          <Route path="/register" element={<Register />} />

          {/* 문제 목록 & 오답 노트 (주석 해제해서 사용하세요) */}
          <Route path="/problems" element={<Problem />} />
          <Route path="/incorrect" element={<Incorrect />} />

          {/* 잘못된 경로는 로그인으로 리다이렉트 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;