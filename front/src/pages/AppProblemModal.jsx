import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const AppProblemModal = ({ isOpen, onClose, onSuccess }) => {
  const [inputProblemId, setInputProblemId] = useState('');
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('SUCCESS');
  const [useLanguage, setUseLanguage] = useState('C++');
  
  /* 1. 상태 변수 이름을 firstMemo에서 memo로 변경 */
  const [memo, setMemo] = useState(''); 
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
    /* 2. 유효성 검사 시 변수명 확인 */
    if (!preview || !memo || isSubmitting) return; 
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      /* 3. 백엔드에서 받는 키값 'memo'와 전송할 상태 'memo'를 일치시킴 */
      await axios.post(`http://localhost:3000/problem/upload`, {
        problem_id: inputProblemId,
        status: status,
        use_language: useLanguage,
        memo: memo 
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      onSuccess();
      handleClose();
      alert("학습 데이터가 저장되었습니다.");
    } catch (err) {
      alert("저장 오류: " + (err.response?.data?.message || "서버 에러"));
    } finally { setIsSubmitting(false); }
  };

  /* 4. 초기화 함수에서도 memo로 수정 */
  const handleClose = () => { setInputProblemId(''); setPreview(null); setMemo(''); onClose(); };

  return (
    <div className="modal-overlay">
      <div className="modal-box modal-wide">
        <div className="modal-header"><h3>학습 데이터 입력</h3></div>
        <div className="modal-body">
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
                    <option value="C">C</option>
                    <option value="C++">C++</option>
                    <option value="C#">C#</option>
                    <option value="Java">Java</option>
                    <option value="Python">Python</option>
                  </select>
                </div>
              </div>

              <div className="modal-section">
                <label>{status === 'SUCCESS' ? '알고리즘 및 풀이 과정' : '미해결 사유 분석'}</label>
                {/* 5. value와 onChange 핸들러를 memo 상태에 연결 */}
                <textarea 
                   value={memo} 
                   onChange={(e) => setMemo(e.target.value)} 
                   placeholder="분석 내용을 기록하세요." 
                   rows="5" 
                />
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