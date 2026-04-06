import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const AppProblemModal = ({ isOpen, onClose, onSuccess }) => {
  const [inputProblemId, setInputProblemId] = useState('');
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('SUCCESS'); // 해결 여부
  const [useLanguage, setUseLanguage] = useState('C++'); // 수행 언어
  const [firstMemo, setFirstMemo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCheck = async () => {
    if (!inputProblemId) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/problem/check/${inputProblemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setPreview(res.data.data);
    } catch (err) {
      alert("문제를 찾을 수 없습니다.");
      setPreview(null);
    }
  };

  const handleSubmit = async () => {
    if (!preview || !firstMemo || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      // 💡 백엔드 destructuring과 Key 이름을 100% 일치시킴
      await axios.post(`http://localhost:3000/problem/upload`, {
        problem_id: inputProblemId,
        status: status,
        use_language: useLanguage,
        first_memo: firstMemo
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      onSuccess();
      handleClose();
      alert("학습 데이터가 저장되었습니다.");
    } catch (err) {
      alert("저장 오류: " + (err.response?.data?.message || "서버 에러"));
    } finally { setIsSubmitting(false); }
  };

  const handleClose = () => { setInputProblemId(''); setPreview(null); setFirstMemo(''); onClose(); };

  return (
    <div className="modal-overlay">
      <div className="modal-box modal-wide">
        <div className="modal-header"><h3>학습 데이터 입력</h3></div>
        <div className="modal-body">
          {/* 조회 섹션: 입력창 + 버튼 한 줄 배치 */}
          <div className="modal-section">
            <label>문제 번호 조회</label>
            <div className="input-group-inline">
              <input type="number" value={inputProblemId} onChange={(e) => setInputProblemId(e.target.value)} placeholder="번호 입력" className="input-narrow" />
              <button className="modal-check-btn-inline" onClick={handleCheck}>조회</button>
            </div>
          </div>

          {preview && (
            <>
              <div className="problem-preview-card">
                <div className="info-row">
                  <span className="info-label">문제명</span>
                  <span className="info-value">{preview.title}</span>
                </div>
              </div>

              {/* 해결 여부(좌) / 수행 언어(우) */}
              <div className="modal-row-grid">
                <div className="modal-section">
                  <label>해결 여부</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="SUCCESS">성공</option><option value="FAIL">미해결</option>
                  </select>
                </div>
                <div className="modal-section">
                  <label>수행 언어</label>
                  <select value={useLanguage} onChange={(e) => setUseLanguage(e.target.value)}>
                    <option value="C++">C++</option><option value="Python">Python</option>
                    <option value="Java">Java</option><option value="JavaScript">JavaScript</option>
                  </select>
                </div>
              </div>

              <div className="modal-section">
                <label>{status === 'SUCCESS' ? '알고리즘 및 풀이 과정' : '미해결 사유 분석'}</label>
                <textarea value={firstMemo} onChange={(e) => setFirstMemo(e.target.value)} placeholder="분석 내용을 기록하세요." rows="5" />
              </div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="modal-submit-btn" disabled={!preview || isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? '저장 중' : '등록하기'}
          </button>
          <button className="modal-close-btn" onClick={handleClose}>취소</button>
        </div>
      </div>
    </div>
  );
};

export default AppProblemModal;