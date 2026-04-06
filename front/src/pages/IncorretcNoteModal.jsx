import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const IncorrectNoteModal = ({ isOpen, onClose, problem, onSuccess }) => {
  // 1. 상태 관리 필드명을 'memo'로 통일
  const [formData, setFormData] = useState({
    memo: ''
  });

  useEffect(() => {
    if (problem) {
      setFormData({
        // 2. 백엔드에서 불러온 데이터도 problem.memo로 접근
        memo: problem.memo || ''
      });
    }
  }, [problem]);

  if (!isOpen || !problem) return null;

  const handleSaveReview = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // 3. formData.memo를 백엔드 'memo' 필드에 담아 전송
      await axios.put(`http://localhost:3000/incorrect/update/${problem.id}`, {
        memo: formData.memo,
        status: 'RETRY_SUCCESS' // 오답 노트 작성 완료 시 상태 변경
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("기록이 완료되었습니다.");
      onSuccess(); 
      onClose();
    } catch (err) {
      console.error("오답 노트 저장 에러:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box review-modal">
        <div className="modal-header">
          <h3>오답 노트 작성</h3>
          <span className="modal-problem-id">No. {problem.problem_id}</span>
        </div>

        <div className="modal-body">
          <div className="review-target-box">
            <div className="detail-item">
              <strong>대상 문제:</strong> <span>{problem.title}</span>
            </div>
            <div className="detail-item">
              <strong>사용 언어:</strong> <span>{problem.use_language}</span>
            </div>
          </div>

          <div className="modal-section">
            <label>복습 메모 </label>
            <textarea 
              className="modal-textarea review-textarea"
              placeholder="해결 방법을 기록."
              // 4. value와 onChange 핸들러도 memo로 변경
              value={formData.memo}
              onChange={(e) => setFormData({ memo: e.target.value })}
              rows="10"
            />
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-right-group" style={{ marginLeft: 'auto' }}>
            <button className="modal-btn-close" onClick={onClose}>취소</button>
            <button className="modal-btn-save" onClick={handleSaveReview}>변경 저장</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncorrectNoteModal;