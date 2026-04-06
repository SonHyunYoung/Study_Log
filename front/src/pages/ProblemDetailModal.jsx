import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const ProblemDetailModal = ({ isOpen, onClose, problem, onSuccess }) => {
  const [isEditing, setIsEditing] = useState(false);
  // first_memo를 memo로 변경
  const [formData, setFormData] = useState({ use_language: '', memo: '' });

  useEffect(() => {
    if (problem) {
      setFormData({
        use_language: problem.use_language || 'C++',
        // DB에서 가져온 problem.memo를 연결
        memo: problem.memo || ''
      });
      setIsEditing(false);
    }
  }, [problem]);

  if (!isOpen || !problem) return null;

  // 수정 로직: memo 필드를 서버로 전송
  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`http://localhost:3000/problem/update/${problem.id}`, {
        use_language: formData.use_language,
        memo: formData.memo,
        status: problem.status
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

  // 삭제 로직: axios.delete를 사용하여 서버에 삭제 요청
  const handleDelete = async () => {
    if (!window.confirm("정말 이 문제를 삭제하시겠습니까?")) return;

    try {
      const token = localStorage.getItem('token');
      const res = await axios.delete(`http://localhost:3000/problem/delete/${problem.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert("삭제되었습니다.");
        onSuccess(); // 목록 새로고침
        onClose(); // 모달 닫기
      }
    } catch (err) {
      console.error("삭제 중 오류 발생:", err);
      alert("삭제 실패");
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
              // first_memo 대신 memo 연결
              value={formData.memo} 
              onChange={(e) => setFormData({...formData, memo: e.target.value})}
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
              {/* 삭제 핸들러 연결 */}
              <button className="modal-btn-delete" onClick={handleDelete}>삭제</button>
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