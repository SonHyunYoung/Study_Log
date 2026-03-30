import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ nickname }) => {
  const navigate = useNavigate();
  const location = useLocation(); // 현재 페이지 위치 확인용

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // 현재 경로에 따라 active 클래스 부여
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <header className="db-header-dark">
      <div className="db-logo" onClick={() => navigate('/main')}>Study LOG</div>
      <nav className="db-nav-center">
        <span className={`db-nav-link ${isActive('/main')}`} onClick={() => navigate('/main')}>
          메인 페이지
        </span>
        <span className={`db-nav-link ${isActive('/problems')}`} onClick={() => navigate('/problems')}>
          문제 목록
        </span>
        <span className={`db-nav-link ${isActive('/incorrect')}`} onClick={() => navigate('/incorrect')}>
          오답 노트
        </span>
      </nav>
      <div className="db-user-info">
        <span className="db-nickname-text"><strong>{nickname || '사용자'}</strong>님</span>
        <span className="db-divider-small">|</span>
        <span className="db-logout-text" onClick={handleLogout}>로그아웃</span>
      </div>
    </header>
  );
};

export default Header;