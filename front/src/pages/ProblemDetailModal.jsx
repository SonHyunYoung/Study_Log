import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const ProblemDetailModal = ({ isOpen, onClose, problem, onSuccess }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ use_language: '', first_memo: '' });

  useEffect(() => {
    if (problem) {
      setFormData({
        use_language: problem.use_language || 'C++',
        first_memo: problem.first_memo || ''
      });
      setIsEditing(false);
    }
  }, [problem]);

  if (!isOpen || !problem) return null;

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`http://localhost:3000/problem/update/${problem.id}`, {
        ...formData,
        status: problem.status,
        retry_memo: problem.retry_memo 
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("정보가 수정되었습니다.");
      onSuccess(); 
      setIsEditing(false);
    } catch (err) {
      alert("수정 실패");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3>문제 상세 정보</h3>
          <span className="modal-problem-id">No. {problem.problem_id}</span>
        </div>

        <div className="modal-body">
          <div className="detail-item title-highlight-box">
            <strong>문제 제목:</strong> <span>{problem.title}</span>
          </div>

          <div className="modal-input-grid">
            <div className="modal-section status-container">
              <label>현재 상태</label>
              <div className="status-readonly-display">
                <span className="status-icon">
                  {problem.status === 'SUCCESS' ? '정답' : '복습 완료'}
                </span>
              </div>
            </div>
            
            <div className="modal-section">
              <label>사용 언어</label>
              <select 
                className="modal-select"
                disabled={!isEditing} 
                value={formData.use_language} 
                onChange={(e) => setFormData({...formData, use_language: e.target.value})}
              >
                <option value="C">C</option>
                <option value="C++">C++</option>
                <option value="C#">C#</option>
                <option value="Java">Java</option>
                <option value="Python">Python</option>
              </select>
            </div>
          </div>
          
          <div className="modal-section">
            <label>풀이 메모</label>
            <textarea 
              className="modal-textarea"
              readOnly={!isEditing} 
              value={formData.first_memo} 
              onChange={(e) => setFormData({...formData, first_memo: e.target.value})}
              rows="4"
            />
          </div>
        </div>

        <div className="modal-footer">
          {isEditing ? (
            <div className="footer-right-group" style={{ marginLeft: 'auto' }}>
              <button className="modal-btn-cancel" onClick={() => setIsEditing(false)}>취소</button>
              <button className="modal-btn-save" onClick={handleUpdate}>변경 저장</button>
            </div>
          ) : (
            <>
              <button className="modal-btn-delete" onClick={() => { /* 삭제 로직 */ }}>삭제</button>
              <div className="footer-right-group">
                <button className="modal-btn-edit" onClick={() => setIsEditing(true)}>정보 수정</button>
                <button className="modal-btn-close" onClick={onClose}>닫기</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetailModal;