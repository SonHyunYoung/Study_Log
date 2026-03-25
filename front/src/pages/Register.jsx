import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [isEmailChecked, setIsEmailChecked] = useState(false); // 중복 확인 상태
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  // 이메일 중복 확인 핸들러
  const handleCheckEmail = async () => {
    if (!email) {
      setError('이메일을 먼저 입력해주세요.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:3000/api/auth/check-email', { email });
      if (response.data.success) {
        alert('사용 가능한 이메일입니다.');
        setIsEmailChecked(true);
        setError('');
      }
    } catch (err) {
      setError(err.response?.data?.message || '이미 사용 중인 이메일입니다.');
      setIsEmailChecked(false);
    }
  };

  // 회원가입 제출 핸들러
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!isEmailChecked) {
      setError('이메일 중복 확인이 필요합니다.');
      return;
    }
    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        email, name, password
      });

      if (response.data.success) {
        alert('회원가입이 완료되었습니다!');
        navigate('/login');
      }
    } catch (err) {
      setError(err.response?.data?.message || '가입 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="split-container">
      {/* 40% 왼쪽: 브랜드 섹션 */}
      <div className="split-left">
        <div className="brand-message">
          <h2>Join Us</h2>
          <p>오늘의 오답이<br/>내일의 정답이 되는 공간</p>
          <div className="brand-line"></div>
        </div>
      </div>

      {/* 60% 오른쪽: 폼 섹션 */}
      <div className="split-right">
        <div className="register-form-wrapper">
          <div className="register-header">
            <h1 className="register-title">회원가입</h1>
            <div className="title-underline"></div>
          </div>

          <form className="register-form" onSubmit={handleRegister}>
            {/* 이메일 입력 섹션 부분 */}
            <div className="form-group">
             <label className="form-label"><span className="required">*</span>이메일</label>
             <div className="email-input-wrapper">
             <input 
             type="email" 
             className="form-input email-field" 
             value={email}
             onChange={(e) => { setEmail(e.target.value); setIsEmailChecked(false); }}
             placeholder="example@study.com"
            />
            {/* ⭐️ 이름 변경: 중복확인 -> 사용가능확인 */}
             <button type="button" className="check-btn" onClick={handleCheckEmail}>
              중복확인
            </button>
            </div>
        </div>

            <div className="form-group">
              <label className="form-label"><span className="required">*</span> 이름</label>
              <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label"><span className="required">*</span> 비밀번호</label>
              <input type="password" className="form-input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label"><span className="required">*</span> 비밀번호 확인</label>
              <input type="password" className="form-input" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
            </div>

            {error && <div className="error-box"><span className="error-text">{error}</span></div>}

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? '처리 중...' : '가입하기'}
            </button>
          </form>

          <div className="register-footer">
            <span>이미 계정이 있으신가요? <Link to="/login">로그인하기</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;                    