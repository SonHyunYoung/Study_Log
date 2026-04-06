import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RegisterModal from './AppProblemModal';
import ProblemDetailModal from './ProblemDetailModal';
import '../App.css';

const Problems = () => {
  const navigate = useNavigate();
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get(`http://localhost:3000/problem?page=${currentPage}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setDbData(response.data);
      }
    } catch (err) {
      console.error("데이터 로드 에러:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRowClick = (problem) => {
    setSelectedProblem(problem);
    setIsDetailModalOpen(true);
  };

  if (loading) return <div className="db-loading-container">데이터 로딩 중...</div>;

  const { 
    data: problems = [], 
    pagination = { totalPages: 1 }, 
    user = { nickname: '사용자' } 
  } = dbData || {};

  /* 1. status가 FAIL인 데이터를 제외하고 필터링 */
  const filteredProblems = problems.filter(p => p.status !== 'FAIL');

  return (
    <div className="db-container">
      <header className="db-header-dark">
        <div className="db-logo" onClick={() => navigate('/main')}>Study LOG</div>
        <nav className="db-nav-center">
          <span className="db-nav-link" onClick={() => navigate('/main')}>메인 페이지</span>
          <span className="db-nav-link active">문제 목록</span>
          <span className="db-nav-link" onClick={() => navigate('/incorrect')}>오답 노트</span>
        </nav>
        <div className="db-user-info">
          <span className="db-nickname-text"><strong>{user.nickname}</strong> 님</span>
          <span className="db-header-divider">|</span>
          <span className="db-logout-text" onClick={handleLogout}>로그아웃</span>
        </div>
      </header>

      <main className="db-page-content">
        <div className="db-title-area">
          <h2 className="db-page-title">전체 문제 목록</h2>
        </div>

        <div className="db-widget-box">
          <table className="db-custom-table">
            <thead>
              <tr>
                <th>No</th>
                <th>문제번호</th>
                <th>제 목</th>
                <th>난이도</th>
                <th>상태</th>
                <th>등록일</th>
              </tr>
            </thead>
            <tbody>
              {/* 2. 필터링된 리스트를 기반으로 렌더링 */}
              {filteredProblems && filteredProblems.length > 0 ? (
                filteredProblems.map((p, index) => (
                  <tr key={p.id || index} onClick={() => handleRowClick(p)} className="table-row-clickable">
                    <td>{(currentPage - 1) * 10 + (index + 1)}</td>
                    <td>{p.problem_id}</td>
                    <td className="table-title-cell">{p.title}</td>
                    
                    <td>
                      <span className={`difficulty-text diff-${p.tier >= 11 ? 'gold' : p.tier >= 6 ? 'silver' : 'bronze'}`}>
                        {p.tier >= 11 ? '상' : p.tier >= 6 ? '중' : '하'}
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge status-${p.status?.toLowerCase() || 'default'}`}>
                        {p.status === 'SUCCESS' ? '정답' : '복습완료'}
                      </span>
                    </td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="table-empty-row">표시할 데이터가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pagination-container">
            <button 
              className="page-arrow"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              &lt;
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
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
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              &gt;
            </button>
          </div>

          <div className="db-bottom-action">
            <button className="db-add-btn" onClick={() => setIsModalOpen(true)}>
              + 문제 추가
            </button>
          </div>
        </div>
      </main>

      <RegisterModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchData} 
      />

      <ProblemDetailModal 
        isOpen={isDetailModalOpen} 
        onClose={() => setIsDetailModalOpen(false)} 
        problem={selectedProblem} 
        onSuccess={fetchData} 
      />
    </div>
  );
};

export default Problems;