// src/components/Header.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css';

const Header = () => {
  const location = useLocation(); // 현재 페이지 위치 파악
  const nickname = localStorage.getItem('nickname') || '사용자';

  return (
    <header className="db-header">
      <div className="header-left">
        <Link to="/main" className="header-logo" style={{textDecoration:'none', color:'#000'}}>
          Study LOG
        </Link>
      </div>

      <nav className="header-nav">
        {/* 현재 경로에 따라 active 클래스를 줘서 강조할 수 있습니다 */}
        <Link to="/main" className={`nav-item ${location.pathname === '/main' ? 'active' : ''}`}>메인 페이지</Link>
        <span className="nav-divider">|</span>
        <Link to="/problems" className={`nav-item ${location.pathname === '/problems' ? 'active' : ''}`}>문제 목록</Link>
        <span className="nav-divider">|</span>
        <Link to="/incorrect" className={`nav-item ${location.pathname === '/incorrect' ? 'active' : ''}`}>오답 노트</Link>
      </nav>

      <div className="header-right">
        <span className="user-nickname"><strong>{nickname}</strong>님</span>
        <span className="nav-divider">|</span>
        <button className="logout-btn" onClick={() => { localStorage.clear(); window.location.href='/'; }}>
          로그아웃
        </button>
      </div>
    </header>
  );
};

export default Header;