import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis 
} from 'recharts';
import Header from '../components/Header'; // 👈 분리한 헤더 불러오기


const MainDashboard = () => {
  const navigate = useNavigate();
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. 데이터 가져오기 (JWT 인증 및 에러 핸들링)
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/'); // 토큰 없으면 로그인으로
          return;
        }

        const response = await axios.get('http://localhost:3000/main', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setDbData(response.data);
        }
      } catch (err) {
        console.error("Dashboard Fetch Error:", err);
        if (err.response?.status === 401) navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // 2. 로딩 화면
  if (loading) {
    return <div className="db-loading-container">데이터를 분석 중입니다...</div>;
  }

  // 3. 데이터 안전 추출 (철벽 방어 로직)
  const { 
    user = { nickname: 'USER' }, 
    stats = { 
      summary: { total: 0, correct: 0, incorrect: 0 }, 
      difficultyData: [], 
      languageData: [], 
      reviewList: [] 
    } 
  } = dbData || {};

  const { summary, difficultyData, languageData, reviewList } = stats;
  const COLORS = ['#333', '#555', '#777', '#999', '#bbb'];

  return (
    <div className="db-container">
      {/* --- 공통 헤더 컴포넌트 (직선 디자인) --- */}
      <Header nickname={user.nickname} />

      {/* --- 요약 스탯 섹션 (라운딩 디자인) --- */}
      <section className="db-summary-section">
        <div className="db-summary-card">
          <div className="db-summary-unit">
            <p className="db-summary-label">푼 문제 수</p>
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

      {/* --- 하단 위젯 그리드 (라운딩 디자인) --- */}
      <section className="db-widget-container">
        {/* 복습 필요 위젯 */}
        <div className="db-widget-box">
          <h4>복습 필요</h4>
          <ul className="db-review-list">
            {reviewList.length > 0 ? (
              reviewList.map((item, idx) => (
                <li key={item.id || idx}>{idx + 1}. {item.title}</li>
              ))
            ) : (
              <li className="no-data-item">오답이 없습니다. 완벽해요! ✨</li>
            )}
          </ul>
        </div>

        {/* 난이도 분포 (Tier 기반) */}
        <div className="db-widget-box">
          <h4>난이도 분포</h4>
          <div className="db-chart-space">
            {difficultyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={difficultyData} 
                    dataKey="value" 
                    outerRadius="85%" 
                    innerRadius="55%"
                    paddingAngle={5}
                  >
                    {difficultyData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="chart-no-data">데이터가 없습니다.</p>}
          </div>
        </div>

        {/* 언어 통계 */}
        <div className="db-widget-box">
          <h4>언어 통계</h4>
          <div className="db-chart-space">
            {languageData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={languageData} layout="vertical">
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