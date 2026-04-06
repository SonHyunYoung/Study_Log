import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const IncorrectNoteModal = ({ isOpen, onClose, problem, onSuccess }) => {
  // 백엔드 필드명인 'review'에 맞춰 상태 관리
  const [formData, setFormData] = useState({
    review: ''
  });

  useEffect(() => {
    if (problem) {
      setFormData({
        // 기존에 review 데이터가 있으면 불러오고, 없으면 빈 값 처리
        review: problem.review || ''
      });
    }
  }, [problem]);

  if (!isOpen || !problem) return null;

  const handleSaveReview = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // 무결성을 위해 memo와 함께 변경될 status를 명시적으로 전달합니다.
    await axios.put(`http://localhost:3000/incorrect/update/${problem.id}`, {
      memo: formData.memo,
      status: 'RETRY_SUCCESS' // 오답 노트 작성 시 '복습 완료'로 상태 전이
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    alert("기록이 완료되었습니다.");
    onSuccess(); 
    onClose();
  } catch (err) {
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
              placeholder="해결 방법을 기록하세요."
              value={formData.review}
              onChange={(e) => setFormData({ review: e.target.value })}
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