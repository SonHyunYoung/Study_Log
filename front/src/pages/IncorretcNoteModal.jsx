import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const IncorrectNoteModal = ({ isOpen, onClose, problem, onSuccess }) => {
  const [newMemo, setNewMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNewMemo(''); 
    }
  }, [isOpen]);

  if (!isOpen || !problem) return null;

  const handleSaveReview = async () => {
    if (!newMemo.trim()) {
      alert("풀이 내용을 입력해주세요.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // [데이터 저장] 기존 메모는 버리고, 새로 작성한 풀이(newMemo)만 저장
      await axios.put(`http://localhost:3000/incorrect/update/${problem.id}`, {
        memo: newMemo, 
        status: 'RETRY_SUCCESS'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("복습 기록이 완료되었습니다.");
      onSuccess(); 
      onClose();
    } catch (err) {
      console.error("저장 에러:", err);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box review-modal">
        <div className="modal-header">
          <div className="header-title-group">
            <h3>오답 기록 작성</h3>
            <span className="modal-problem-id">No. {problem.problem_id}</span>
          </div>
        </div>

        <div className="modal-body">
          <div className="review-target-info">
            <strong>{problem.title}</strong>
            <span className="lang-tag">{problem.use_language}</span>
          </div>

          {/* 기존 오답 이유 (참조용으로만 노출) */}
          <div className="reason-display-box">
            <label className="reason-label">이전 오답 이유</label>
            <div className="reason-content">
              {problem.memo || "기록된 내용이 없습니다."}
            </div>
          </div>

          {/* 새로운 풀이 내용 입력 */}
          <div className="modal-section">
            <label className="input-label">최종 풀이 및 학습 내용</label>
            <textarea 
              className="modal-textarea review-input"
              placeholder="해결한 로직이나 정답 코드를 기록하세요."
              value={newMemo}
              onChange={(e) => setNewMemo(e.target.value)}
              rows="10"
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn-close" onClick={onClose}>취소</button>
          <button 
            className="modal-btn-save-review" 
            onClick={handleSaveReview}
            disabled={isSubmitting}
          >
            {isSubmitting ? '처리 중' : '복습 완료 및 저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncorrectNoteModal;