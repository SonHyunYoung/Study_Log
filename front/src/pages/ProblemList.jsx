import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

const ProblemList = () => {
  const navigate = useNavigate();
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 데이터 페칭 (MainDashboard와 동일한 '철벽' 로직)
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:3000/problem', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setDbData(response.data);
        } else {
          console.error("서버 응답 실패:", response.data.err_message);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        // 401, 403 에러 시 로그인 페이지로 튕기기
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        // ⭐️ 어떤 에러가 나도 로딩은 꺼야 합니다.
        setLoading(false);
      }
    };

    fetchProblems();
  }, [navigate]);

  // 2. 로그아웃
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // 3. 로딩 중 화면
  if (loading) {
    return <div className="db-loading-container">데이터를 불러오는 중입니다...</div>;
  }

  // 4. 데이터 안전 추출 (MainDashboard와 동일)
  const { 
    user = { nickname: '사용자' }, 
    data: problems = [] 
  } = dbData || {};

  return (
    <div className="db-container">
      {/* --- 다크 헤더 --- */}
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
          <span className="db-logout-text" onClick={handleLogout}>로그아웃</span>
        </div>
      </header>

      {/* --- 게시물 리스트 본문 --- */}
      <main className="db-page-content">
        <div className="db-title-area">
          <h2 className="db-page-title">내가 푼 문제 목록</h2>
        </div>

        <div className="db-widget-box">
          <table className="db-custom-table">
            <thead>
              <tr>
                <th>id</th>
                <th>문제번호</th>
                <th>제 목</th>
                <th>난이도</th>
                <th>상태</th>
                <th>등록 날짜</th>
              </tr>
            </thead>
            <tbody>
              {problems.length > 0 ? (
                problems.map((p, index) => (
                  <tr key={p.id || index}>
                    <td>{index + 1}</td>
                    <td>{p.problem_id}</td>
                    <td className="table-title-cell">{p.title}</td>
                    <td><span className={`tier-badge tier-${p.tier}`}>{p.tier}</span></td>
                    <td>
                      <span className={`status-badge ${p.status === 'SUCCESS' ? 'success' : 'fail'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6">등록된 게시물이 없습니다.</td></tr>
              )}
            </tbody>
          </table>

          {/* --- 등록 버튼 (Flat 디자인) --- */}
          <div className="db-action-area">
            <button className="btn-add-problem" onClick={() => alert("등록 모달 준비 중!")}>
              등록
            </button>
          </div>

          <div className="pagination">
            <span>&lt;&lt; 1, 2, 3, 4, 5 &gt;&gt;</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProblemList;