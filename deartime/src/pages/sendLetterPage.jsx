import React, { useState } from 'react';
import '../styles/sendLetter.css';
import theme1 from '../assets/bg-dark-blue.png';
import theme2 from '../assets/bg-light-blue.png';
import theme3 from '../assets/bg-light-grey.png';
import theme4 from '../assets/bg-light-pink.png';
import backgroundImg from '../assets/background.svg';

const SendLetter = () => {
  // 4가지 테마 정의
  const themes = [
    { id: 1, imageUrl: theme1 },
    { id: 2, imageUrl: theme2 },
    { id: 3, imageUrl: theme3 },
    { id: 4, imageUrl: theme4 },
  ];

  const [selectedThemeId, setSelectedThemeId] = useState(1);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleFriendListClick = () => {
    alert("친구 추가는 준비중입니다");
  };

  // 현재 선택된 테마 객체 찾기
  const currentTheme = themes.find(t => t.id === selectedThemeId);

  // 제목과 내용이 모두 비어있지 않아야 함
  const isFormValid = title.trim() !== '' && content.trim() !== '';

  const handleSend = () => {
    if (isFormValid) {
      alert("편지를 보냈습니다!");
      // TODO: 실제 전송 로직 추가
    }
  };

  return (
    <div className="page-container" style={{ backgroundImage: `url(${backgroundImg})` }}>
      <div className="content-wrapper">
        <div className="glass-card">
            {/* 편지지 테마 선택 영역 */}
        <div className="theme-sidebar">
          {themes.map((theme) => (
            <div 
              key={theme.id} 
              className={`theme-option ${selectedThemeId === theme.id ? 'active' : ''}`}
              style={{ backgroundImage: `url(${theme.imageUrl})` }}
              onClick={() => setSelectedThemeId(theme.id)}
            >
              {selectedThemeId === theme.id && (
                <div className="check-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 편지 작성 영역 */}
        <div 
          className="letter-editor" 
          style={{ backgroundImage: `url(${currentTheme.imageUrl})` }}
        >
          <div className="editor-header">
            <h3>편지</h3>
            <button className="close-btn">✕</button>
          </div>

          <div className="input-group">
            <div className="input-row">
              <span className="label">받는 사람</span>
              <button className="arrow-btn" onClick={handleFriendListClick}>〉</button>
            </div>
            
            <div className="input-row">
              <input 
                type="text" 
                placeholder="제목" 
                className="title-input" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="content-area">
              <textarea 
                placeholder="내용을 입력하세요" 
                className="text-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="editor-footer">
            <button 
              className="send-btn" 
              onClick={handleSend}
              disabled={!isFormValid} // 유효하지 않으면 버튼 비활성화
              style={{ opacity: isFormValid ? 1 : 0.5, cursor: isFormValid ? 'pointer' : 'not-allowed' }}
            >
              보내기
            </button>
          </div>
        </div>
        </div>
        </div>
    </div>
  );
};

export default SendLetter;