// 로그인 페이지

import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // 로그인 시도 시 기존 에러 초기화

    try {
      const response = await axios.post('http://localhost:3000/login', {
        email,
        password
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        alert('로그인 성공!');
        // 메인 페이지 구성 전이므로 현재는 알림만 띄웁니다.
      }
    } catch (err) {
      // 서버 에러 메시지 반영
      setError(err.response?.data?.message);
    }
  };

  return (
    <div className="login-container">
      {/* 왼쪽 패널 (60%) */}
      <div className="left-panel">
        <p>알고리즘 문제 풀이 학습을 기록하는<br/>당신만의 오답 노트 Study LOG.</p>
      </div>

      {/* 오른쪽 패널 (40%) */}
      <div className="right-panel">
        <h1 className="title">Study LOG</h1>
        <form onSubmit={handleLogin} className="login-form">
          <input 
            type="email" 
            placeholder="이메일" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="비밀번호" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />

          {/* 에러 발생 시에만 나타나는 영역 (버튼을 밀어냄) */}
          {error && (
            <div className="error-box">
              <span className="error-text">{error}</span>
            </div>
          )}

          <button type="submit" className="login-btn">로그인</button>
        </form>
        
        <div className="footer-links">
          <span>계정이 없으신가요? <a href='./Registe'>회원가입</a></span>
        </div>
      </div>
    </div>
  );
};

export default Login;