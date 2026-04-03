import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const Problems = () => {
  const navigate = useNavigate();
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태

  // 1. 데이터 가져오기: 페이지 번호가 바뀔 때마다 서버에 요청합니다.
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get(`http://localhost:3000/problems?page=${currentPage}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setDbData(response.data);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        // 토큰 만료 등 인증 에러 시 로그인으로 이동
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, [navigate, currentPage]);

  if (loading) return <div className="db-loading-container">데이터 로딩 중...</div>;

  // 데이터 구조 분해 할당 (기본값 설정으로 에러 방지)
  const { 
    user = { nickname: '사용자' }, 
    data: problems = [],
    pagination = { totalPages: 1 } 
  } = dbData || {};

  return (
    <div className="db-container">
      {/* --- 상단 다크 헤더 --- */}
      <header className="db-header-dark">
        <div className="db-logo" onClick={() => navigate('/main')}>Study LOG</div>
        <nav className="db-nav-center">
          <span className="db-nav-link" onClick={() => navigate('/main')}>메인 페이지</span>
          <span className="db-nav-link active">문제 목록</span>
          <span className="db-nav-link" onClick={() => navigate('/incorrect')}>오답 노트</span>
        </nav>
        <div className="db-user-info">
          <span className="db-nickname-text"><strong>{user.nickname}</strong>님</span>
          <span className="db-divider-small">|</span>
          <span className="db-logout-text" onClick={() => { localStorage.clear(); navigate('/'); }}>로그아웃</span>
        </div>
      </header>

      {/* --- 본문 콘텐츠 --- */}
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
              {problems && problems.length > 0 ? (
                problems.map((p, index) => (
                  <tr key={p.id || index}>
                    {/* 전체 순번 계산 로직 */}
                    <td>{(currentPage - 1) * 10 + (index + 1)}</td>
                    <td>{p.problem_id}</td>
                    <td className="table-title-cell">{p.title}</td>
                    <td>
                      <span className={`tier-badge tier-${p.tier?.toLowerCase()}`}>
                        {p.tier}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${p.status?.toLowerCase()}`}>
                        {p.status === 'FAIL' ? '미해결' : p.status === 'SUCCESS' ? '정답' : '복습완료'}
                      </span>
                    </td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                /* --- 데이터가 없을 때 표시되는 행 --- */
                <tr>
                  <td colSpan="6" className="table-empty-row">
                    등록된 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* --- 동적 페이지네이션 버튼 --- */}
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

          {/* --- 하단 액션 영역: 초록색 추가 버튼 --- */}
          <div className="db-bottom-action">
            <button className="db-add-btn">+ 문제 추가</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Problems;