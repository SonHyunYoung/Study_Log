import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import IncorrectNoteModal from './IncorretcNoteModal';
import '../App.css';

const IncorrectNote = () => {
  const navigate = useNavigate();
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // 모달 제어를 위한 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // 데이터를 가져오는 로직을 useCallback으로 분리하여 모달 성공 시 재사용 가능하게 함
  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      const res = await axios.get(`http://localhost:3000/incorrect?page=${currentPage}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setDbData(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [currentPage, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 테이블 행 클릭 시 실행되는 함수
  const handleRowClick = (problem) => {
    setSelectedProblem(problem);
    setIsModalOpen(true);
  };

  if (loading) return <div className="db-loading-container">데이터 로딩 중...</div>;

  const { 
    data: notes = [], 
    pagination = { totalPages: 1 }, 
    user = { nickname: '사용자' } 
  } = dbData || {};

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
              <tr>
                <th>No</th>
                <th>문제번호</th>
                <th>제 목</th>
                <th>난이도</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {notes.length > 0 ? (
                notes.map((n, i) => (
                  /* 행 클릭 이벤트와 스타일 클래스 추가 */
                  <tr 
                    key={n.id} 
                    onClick={() => handleRowClick(n)} 
                    className="table-row-clickable"
                  >
                    <td>{(currentPage - 1) * 10 + (i + 1)}</td>
                    <td>{n.problem_id}</td>
                    <td className="table-title-cell">{n.title}</td>
                    <td>
                      <span className={`difficulty-text diff-${n.tier >= 11 ? 'gold' : n.tier >= 6 ? 'silver' : 'bronze'}`}>
                        {n.tier >= 11 ? '상' : n.tier >= 6 ? '중' : '하'}
                      </span>
                    </td>
                    <td>{new Date(n.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="table-empty-row">등록된 오답 데이터가 없습니다.</td></tr>
              )}
            </tbody>
          </table>

          <div className="pagination-container">
            <button 
              className="page-arrow" 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)}
            >
              &lt;
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(num => (
              <button 
                key={num} 
                className={`page-number ${num === currentPage ? 'active' : ''}`} 
                onClick={() => setCurrentPage(num)}
              >
                {num}
              </button>
            ))}
            
            <button 
              className="page-arrow" 
              disabled={currentPage === pagination.totalPages} 
              onClick={() => setCurrentPage(p => p + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      </main>

      {/* 오답 복습 모달 연결 */}
      <IncorrectNoteModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        problem={selectedProblem} 
        onSuccess={fetchData} 
      />
    </div>
  );
};

export default IncorrectNote;