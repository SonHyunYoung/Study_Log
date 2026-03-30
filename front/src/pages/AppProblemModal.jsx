import React, { useState } from 'react';
import axios from 'axios';

const AddProblemModal = ({ isOpen, onClose, onRefresh }) => {
  const [formData, setFormData] = useState({
    problem_id: '',
    status: 'SUCCESS',
    use_language: 'C++',
    review: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // 백엔드에 문제 번호만 던지면 제목/티어는 백엔드가 처리함!
      const response = await axios.post('http://localhost:3000/problem', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert(`${response.data.data.title} (${response.data.data.tier}) 등록 완료!`);
        onRefresh(); // 목록 새로고침
        onClose();   // 모달 닫기
      }
    } catch (err) {
      alert(err.response?.data?.message || "등록 실패! 문제 번호를 확인하세요.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content db-widget-box">
        <div className="modal-header">
          <h3>새 문제 기록하기</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="input-group">
            <label>문제 번호 (Baekjoon)</label>
            <input 
              type="number" 
              placeholder="예: 1000" 
              required
              value={formData.problem_id}
              onChange={(e) => setFormData({...formData, problem_id: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label>결과</label>
            <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
              <option value="SUCCESS">SUCCESS (정답)</option>
              <option value="FAIL">FAIL (오답)</option>
            </select>
          </div>

          <div className="input-group">
            <label>사용 언어</label>
            <select value={formData.use_language} onChange={(e) => setFormData({...formData, use_language: e.target.value})}>
              <option value="C++">C++</option>
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="JavaScript">JavaScript</option>
            </select>
          </div>

          <div className="input-group">
            <label>메모 (오답노트용)</label>
            <textarea 
              placeholder="틀린 이유나 핵심 로직을 적어주세요."
              value={formData.review}
              onChange={(e) => setFormData({...formData, review: e.target.value})}
            />
          </div>

          <button type="submit" className="btn-add-problem full-width">등록하기</button>
        </form>
      </div>
    </div>
  );
};

export default AddProblemModal;