import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';
import '../App.css';

const DIFFICULTY_COLORS = { '하': '#ad5600', '중': '#435f7a', '상': '#ec9a00' };

const MainDashboard = () => {
  const navigate = useNavigate();
  const [dbData, setDbData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMainData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      const res = await axios.get('http://localhost:3000/main', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setDbData(res.data);
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    } finally { setLoading(false); }
  }, [navigate]);

  useEffect(() => { fetchMainData(); }, [fetchMainData]);

  if (loading) return <div className="db-loading-container">데이터 분석 중...</div>;

  const { user = { nickname: '사용자' }, stats = { summary: { total: 0, success: 0, fail: 0, retry: 0 }, difficultyData: [], languageData: [], reviewList: [] } } = dbData || {};

  return (
    <div className="db-container">
      <header className="db-header-dark">
        <div className="db-logo" onClick={() => navigate('/main')}>Study LOG</div>
        <nav className="db-nav-center">
          <span className="db-nav-link active">메인 페이지</span>
          <span className="db-nav-link" onClick={() => navigate('/problems')}>문제 목록</span>
          <span className="db-nav-link" onClick={() => navigate('/incorrect')}>오답 노트</span>
        </nav>
        <div className="db-user-info">
          <span><strong>{user.nickname}</strong>님</span>
          <span className="db-logout-text" onClick={() => {localStorage.clear(); navigate('/');}}>로그아웃</span>
        </div>
      </header>

      <section className="db-summary-section">
        <div className="db-summary-card">
          <div className="db-summary-unit">
            <p className="db-summary-label">풀이한 문제</p>
            <h3 className="db-summary-value val-total">{stats.summary.total}</h3>
          </div>
          <div className="db-summary-v-divider"></div>
          <div className="db-summary-unit">
            <p className="db-summary-label">정답</p>
            <h3 className="db-summary-value val-correct">{stats.summary.success}</h3>
          </div>
          <div className="db-summary-v-divider"></div>
          <div className="db-summary-unit">
            <p className="db-summary-label">미해결 오답</p>
            <h3 className="db-summary-value val-remaining">{stats.summary.fail}</h3>
          </div>
          <div className="db-summary-v-divider"></div>
          <div className="db-summary-unit">
            <p className="db-summary-label">복습 완료</p>
            <h3 className="db-summary-value val-resolved">{stats.summary.retry}</h3>
          </div>
        </div>
      </section>

      {/* --- 하단 위젯 그리드 --- */}
      <section className="db-widget-container">
        <div className="db-widget-box">
          <h4>복습 필요 기록</h4>
          <ul className="db-review-list">
            {stats.reviewList.length > 0 ? stats.reviewList.map(item => (
              <li key={item.id}>
                <span className={`diff-dot diff-${item.diff >= 11 ? 'gold' : item.diff >= 6 ? 'silver' : 'bronze'}`}></span>
                {item.title}
              </li>
            )) : <li className="no-data-item">복습할 문제가 없습니다.</li>}
          </ul>
        </div>

        <div className="db-widget-box">
          <h4>난이도 분포</h4>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats.difficultyData} dataKey="value" nameKey="name" outerRadius="85%" innerRadius="60%" paddingAngle={5} stroke="none">
                  {stats.difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DIFFICULTY_COLORS[entry.name] || '#ccc'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend-simple">
            <span><i style={{backgroundColor: '#ad5600'}}></i> 하</span>
            <span><i style={{backgroundColor: '#435f7a'}}></i> 중</span>
            <span><i style={{backgroundColor: '#ec9a00'}}></i> 상</span>
          </div>
        </div>

        <div className="db-widget-box">
          <h4>사용 언어 통계</h4>
          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.languageData} layout="vertical" margin={{ left: 10, right: 30 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={70} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}}/>
                <Bar dataKey="problems" fill="#34495e" barSize={12} radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MainDashboard;