import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis 
} from 'recharts';

const MainDashboard = () => {
  const navigate = useNavigate();
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 데이터 가져오기 로직 (JWT 인증 포함)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('http://localhost:3000/main', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setDbData(response.data);
        }
      } catch (err) {
        console.error("Dashboard Data Fetch Error:", err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // 2. 로그아웃 로직
  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // 3. 로딩 중 처리
  if (loading) {
    return <div className="db-loading-container">데이터를 불러오는 중입니다...</div>;
  }

  // 4. 데이터 안전 추출 (Destructuring with Defaults)
  // 백엔드에서 BigInt -> Number 변환 처리가 된 데이터를 안전하게 받습니다.
  const { 
    user = { nickname: '사용자' }, 
    stats = { 
      summary: { total: 0, correct: 0, incorrect: 0 }, 
      difficultyData: [], 
      languageData: [], 
      reviewList: [] 
    } 
  } = dbData || {};

  const summary = stats.summary;
  const COLORS = ['#333', '#555', '#777', '#999', '#bbb'];

  return (
    <div className="db-container">
      {/* --- 네비게이션 바: 직선(Sharp) & 확대 비율 --- */}
      <header className="db-header-dark">
        <div className="db-logo" onClick={() => navigate('/main')}>Study LOG</div>
        <nav className="db-nav-center">
          <span className="db-nav-link active">메인 페이지</span>
          <span className="db-nav-link" onClick={() => navigate('/problems')}>문제 목록</span>
          <span className="db-nav-link" onClick={() => navigate('/incorrect')}>오답 노트</span>
        </nav>
        <div className="db-user-info">
          <span className="db-nickname-text"><strong>{user.nickname}</strong>님</span>
          <span className="db-divider-small">|</span>
          <span className="db-logout-text" onClick={handleLogout}>로그아웃</span>
        </div>
      </header>

      {/* --- 요약 통계: 라운딩(Round) & 강조 스타일 --- */}
      <section className="db-summary-section">
        <div className="db-summary-card">
          <div className="db-summary-unit">
            <p className="db-summary-label">풀이한 문제</p>
            <h3 className="db-summary-value val-total">{summary.total}</h3>
          </div>
          <div className="db-summary-v-divider"></div>
          <div className="db-summary-unit">
            <p className="db-summary-label">정답</p>
            <h3 className="db-summary-value val-correct">{summary.correct}</h3>
          </div>
          <div className="db-summary-v-divider"></div>
          <div className="db-summary-unit">
            <p className="db-summary-label">오답</p>
            <h3 className="db-summary-value val-incorrect">{summary.incorrect}</h3>
          </div>
        </div>
      </section>

      {/* --- 위젯 그리드: 라운딩(Round) 적용 --- */}
      <section className="db-widget-container">
        {/* 복습 필요 위젯 */}
        <div className="db-widget-box">
          <h4>복습 필요</h4>
          <ul className="db-review-list">
            {stats.reviewList.length > 0 ? (
              stats.reviewList.map((item, idx) => (
                <li key={item.id || idx}>{idx + 1}. {item.title}</li>
              ))
            ) : (
              <li className="no-data-item">복습할 문제가 없습니다.</li>
            )}
          </ul>
        </div>

        {/* 난이도 분포 (Pie Chart) */}
        <div className="db-widget-box">
          <h4>난이도 분포</h4>
          <div className="db-chart-space">
            {stats.difficultyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={stats.difficultyData} 
                    dataKey="value" 
                    nameKey="name" 
                    outerRadius="80%" 
                    innerRadius="50%"
                    paddingAngle={5}
                  >
                    {stats.difficultyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="chart-no-data">데이터가 없습니다.</p>}
          </div>
        </div>

        {/* 언어 통계 (Bar Chart) */}
        <div className="db-widget-box">
          <h4>언어 통계</h4>
          <div className="db-chart-space">
            {stats.languageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.languageData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" width={80} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}}/>
                  <Bar dataKey="problems" fill="#222" barSize={12} radius={[0, 10, 10, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="chart-no-data">데이터가 없습니다.</p>}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainDashboard;