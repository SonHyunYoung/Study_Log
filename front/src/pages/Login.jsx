// 로그인 페이지

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // 로그인 시도 시 기존 에러 초기화

    try {
      const response = await axios.post('http://localhost:3000/login', {
        email,
        password
      });

      if (response.data.success) {
        // 1. 유저 정보나 토큰이 있다면 저장 (옵션)
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('nickname', response.data.nickname); 
        localStorage.setItem('token', response.data.token);
      
        // 2. 대시보드로 이동
        navigate('/main');
      }
    } catch (err) {
      // 서버 에러 메시지 반영
      setError(err.response?.data?.message);
    }
  };

  return (
    <div className="login-container">
      {/* 왼쪽 패널 */}
      <div className="left-panel">
        <p>당신의 학습을 기록하는<br/>당신만의 기록 노트 <br/>Study LOG</p>
      </div>

      {/* 오른쪽 패널 */}
      <div className="right-panel">
        <h1 className="title">Study LOG</h1>
        <form onSubmit={handleLogin} className="login-form">
          <input 
            type="email" 
            title = "이메일을 입력해주세요."
            placeholder="이메일" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            title = "비밀번호를 입력해주세요."
            placeholder="비밀번호" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />

          {/* 에러 발생 시에만 나타나는 영역*/}
          {error && (
            <div className="error-box">
              <span className="error-text">{error}</span>
            </div>
          )}

          <button type="submit" className="login-btn">로그인</button>
        </form>
        
        <div className="footer-links">
          <span>계정이 없으신가요? &nbsp;
            <Link to='/register'>회원가입 </Link>
            </span>
        </div>
      </div>
    </div>
  );
};

export default Login;