import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const IncorrectNote = () => {
  const navigate = useNavigate();
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { navigate('/login'); return; }

        const res = await axios.get(`http://localhost:3000/incorrect?page=${currentPage}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setDbData(res.data);
      } catch (err) {
        if (err.response?.status === 401) navigate('/login');
      } finally { setLoading(false); }
    };
    fetchData();
  }, [currentPage, navigate]);

  if (loading) return <div className="db-loading-container">데이터 로딩 중...</div>;

  const { data: notes = [], pagination = { totalPages: 1 }, user = { nickname: '사용자' } } = dbData || {};

  return (
    <div className="db-container">
      <header className="db-header-dark">
        <div className="db-logo" onClick={() => navigate('/main')}>Study LOG</div>
        <nav className="db-nav-center">
          <span className="db-nav-link" onClick={() => navigate('/main')}>메인 페이지</span>
          <span className="db-nav-link" onClick={() => navigate('/problems')}>문제 목록</span>
          <span className="db-nav-link active">오답 노트</span>
        </nav>
        <div className="db-user-info">
          <span className="db-nickname-text"><strong>{user.nickname}</strong>님</span>
          <span className="db-header-divider">|</span>
          <span className="db-logout-text" onClick={handleLogout}>로그아웃</span>
        </div>
      </header>

      <main className="db-page-content">
        <h2 className="db-page-title">나의 오답 노트</h2>
        <div className="db-widget-box">
          <table className="db-custom-table">
            <thead>
              <tr><th>No</th><th>문제번호</th><th>제 목</th><th>난이도</th><th>등록일</th></tr>
            </thead>
            <tbody>
              {notes.length > 0 ? (
                notes.map((n, i) => (
                  <tr key={n.id}>
                    <td>{(currentPage - 1) * 10 + (i + 1)}</td>
                    <td>{n.problem_id}</td>
                    <td className="table-title-cell">{n.title}</td>
                    <td><span className={`tier-badge tier-${n.tier?.toLowerCase()}`}>{n.tier}</span></td>
                    <td>{new Date(n.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="table-empty-row">등록된 오답 데이터가 없습니다.</td></tr>
              )}
            </tbody>
          </table>
          <div className="pagination-container">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>&lt;</button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} className={n === currentPage ? 'active' : ''} onClick={() => setCurrentPage(n)}>{n}</button>
            ))}
            <button disabled={currentPage === pagination.totalPages} onClick={() => setCurrentPage(p => p + 1)}>&gt;</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IncorrectNote;