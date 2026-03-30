import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  
  // 상태 메시지 (실시간 안내)
  const [emailMsg, setEmailMsg] = useState('');
  const [isEmailAvailable, setIsEmailAvailable] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const [isPasswordSecure, setIsPasswordSecure] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [isPasswordMatched, setIsPasswordMatched] = useState(false);
  
  // 최종 에러 (버튼 클릭 시 노출)
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // 1. 비밀번호 실시간 보안 점검
  useEffect(() => {
    const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password) { setPasswordMsg(''); setIsPasswordSecure(false); }
    else if (PASSWORD_REGEX.test(password)) { setPasswordMsg('안전한 비밀번호입니다.'); setIsPasswordSecure(true); }
    else { setPasswordMsg('8자 이상, 대/소문자, 숫자, 특수문자 포함'); setIsPasswordSecure(false); }
  }, [password]);

  // 2. 비밀번호 일치 실시간 확인
  useEffect(() => {
    if (!passwordConfirm) { setConfirmMsg(''); setIsPasswordMatched(false); }
    else if (password === passwordConfirm) { setConfirmMsg('비밀번호가 일치합니다.'); setIsPasswordMatched(true); }
    else { setConfirmMsg('비밀번호가 일치하지 않습니다.'); setIsPasswordMatched(false); }
  }, [password, passwordConfirm]);

  // 3. 이메일 중복 확인 (API: /register/emailCheck)
  const handleCheckEmail = async () => {
    if (!email) { setEmailMsg('이메일을 입력해주세요.'); return; }
    try {
      const response = await axios.post('http://localhost:3000/register/emailCheck', { email });
      if (response.data.success) {
        setEmailMsg('사용 가능한 이메일입니다.');
        setIsEmailAvailable(true);
      }
    } catch (err) {
      setEmailMsg(err.response?.data?.message || '이미 사용 중인 이메일입니다.');
      setIsEmailAvailable(false);
    }
  };

  // 4. 회원가입 버튼 클릭 핸들러
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); 

    const fields = [email, name, password, passwordConfirm];
    const emptyCount = fields.filter(field => !field).length;

    // ⭐️ 리더님 요청 로직: 2개 이상 비었거나 이메일만 입력 시 통합 메시지
    if (emptyCount >= 2 || (email && !name && !password && !passwordConfirm)) {
      setError('필수 사항을 모두 입력해주세요.');
      return;
    }

    // 단일 체크 및 유효성 확인
    if (!email) return setError('이메일을 입력해주세요.');
    if (!isEmailAvailable) return setError('이메일 중복 확인이 필요합니다.');
    if (!name) return setError('이름을 입력해주세요.');
    if (!password) return setError('비밀번호를 입력해주세요.'); 
    if (!isPasswordSecure) return setError('비밀번호 보안 수준을 맞춰주세요.');
    if (!passwordConfirm) return setError('비밀번호 확인을 입력해주세요.');
    if (!isPasswordMatched) return setError('비밀번호가 일치하지 않습니다.');

    setIsLoading(true);
    try {
      // 백엔드 변수명(confirmpassword)에 맞춰 전송
      const response = await axios.post('http://localhost:3000/register', { 
        email, 
        name, 
        password, 
        confirmpassword: passwordConfirm 
      });

      if (response.data.success) {
        alert('회원가입 성공!');
        navigate('/login');
      }
    } catch (err) {
      // 백엔드 에러 키(err_message 또는 message) 대응
      const serverMsg = err.response?.data?.err_message || err.response?.data?.message || '가입 처리 중 오류가 발생했습니다.';
      setError(serverMsg);
    } finally { 
      setIsLoading(false); 
    }
  };

  return (
    <div className="split-container">
      <div className="split-left">
        <div className="brand-message">
          <h2 className="large-join">Join Us</h2>
          <p>오늘의 오답이<br/>내일의 정답이 되는 공간</p>
          <div className="brand-line"></div>
        </div>
      </div>

      <div className="split-right">
        <div className="form-wrapper">
          <div className="header-section">
            <h1 className="page-title">회원가입</h1>
            <div className="title-underline"></div>
          </div>

          <form className="main-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label"><span className="required">*</span>이메일</label>
              <div className="input-with-button">
                <input 
                  type="email" 
                  className="form-input email-field" 
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailMsg(''); setIsEmailAvailable(false); }}
                  placeholder="example@study.com"
                />
                <button type="button" className="side-btn" onClick={handleCheckEmail}>중복 확인</button>
              </div>
              {emailMsg && <p className={`status-msg ${isEmailAvailable ? 'success' : 'error'}`}>{emailMsg}</p>}
            </div>

            <div className="form-group">
              <label className="form-label"><span className="required">*</span> 이름</label>
              <input 
                type="text" 
                className="form-input" 
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder = "2자 이상 ~ 15자 이하" />
            </div>

            <div className="form-group">
              <label className="form-label"><span className="required">*</span> 비밀번호</label>
              <input 
                type="password" 
                className="form-input" 
                value={password} onChange={(e) => setPassword(e.target.value)} 
                placeholder='대소문자와 특수문자 포함 필수 8자 이상 입력'/>
              {passwordMsg && <p className={`status-msg ${isPasswordSecure ? 'success' : 'error'}`}>{passwordMsg}</p>}
            </div>

            <div className="form-group">
              <label className="form-label"><span className="required">*</span> 비밀번호 확인</label>
              <input 
                type="password" 
                className="form-input" 
                value={passwordConfirm} 
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder='비밀번호 재입력' />
              {confirmMsg && <p className={`status-msg ${isPasswordMatched ? 'success' : 'error'}`}>{confirmMsg}</p>}
            </div>

            {/* 빨간 글씨 에러 메시지 */}
            {error && <div className="error-text-only">{error}</div>}

            <button type="submit" className="main-submit-btn" disabled={isLoading}>
              {isLoading ? '가입 진행 중...' : '가입하기'}
            </button>
          </form>

          <div className="bottom-link">
            <span>이미 계정이 있으신가요? <Link to="/login">로그인하기</Link></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;