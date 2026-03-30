import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const IncorrectNote = () => {
  const navigate = useNavigate();
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 데이터 가져오기 (MainDashboard와 동일한 로직)
  useEffect(() => {
    const fetchIncorrect = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const response = await axios.get('http://localhost:3000/incorrect', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setDbData(response.data); // data와 user를 모두 저장
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        if (err.response?.status === 401 || err.response?.status === 403) navigate('/login');
      } finally {
        setLoading(false); // 무조건 로딩 해제
      }
    };
    fetchIncorrect();
  }, [navigate]);

  if (loading) return <div className="db-loading-container">오답 노트 로딩 중...</div>;

  const { 
    user = { nickname: '사용자' }, 
    data: notes = [] 
  } = dbData || {};

  return (
    <div className="db-container">
      {/* --- 다크 헤더 --- */}
      <header className="db-header-dark">
        <div className="db-logo" onClick={() => navigate('/main')}>Study LOG</div>
        <nav className="db-nav-center">
          <span className="db-nav-link" onClick={() => navigate('/main')}>메인 페이지</span>
          <span className="db-nav-link" onClick={() => navigate('/problems')}>문제 목록</span>
          <span className="db-nav-link active">오답 노트</span>
        </nav>
        <div className="db-user-info">
          {/* 이제 '사용자'가 아니라 실제 닉네임이 뜹니다 */}
          <span className="db-nickname-text"><strong>{user.nickname}</strong>님</span>
          <span className="db-divider-small">|</span>
          <span className="db-logout-text" onClick={() => { localStorage.clear(); navigate('/'); }}>로그아웃</span>
        </div>
      </header>

      {/* --- 본문 --- */}
      <main className="db-page-content">
        <div className="db-title-area">
          <h2 className="db-page-title">나의 오답 노트</h2>
        </div>

        <div className="db-widget-box">
          <table className="db-custom-table">
            <thead>
              <tr>
                <th>id</th>
                <th>문제번호</th>
                <th>제 목</th>
                <th>난이도</th>
                <th>등록 날짜</th>
              </tr>
            </thead>
            <tbody>
              {notes.length > 0 ? (
                notes.map((n, index) => (
                  <tr key={n.id || index}>
                    <td>{index + 1}</td>
                    <td>{n.problem_id}</td>
                    <td className="table-title-cell">{n.title}</td>
                    <td><span className={`tier-badge tier-${n.tier}`}>{n.tier}</span></td>
                    <td>{new Date(n.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5">오답 데이터가 없습니다.</td></tr>
              )}
            </tbody>
          </table>

          <div className="pagination">
            <span>&lt;&lt; 1, 2, 3, 4, 5 &gt;&gt;</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IncorrectNote;