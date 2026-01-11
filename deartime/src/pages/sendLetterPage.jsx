import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/sendLetter.css';
import theme1 from '../assets/bg-dark-blue.png';
import theme2 from '../assets/bg-light-blue.png';
import theme3 from '../assets/bg-light-grey.png';
import theme4 from '../assets/bg-light-pink.png';
import FriendSelect from "../components/FriendSelect";

const SendLetter = () => {
  // 4가지 테마 정의
  const themes = [
    {
      id: 1,
      imageUrl: theme1,
      text: 'dark',
      button: 'dark',
    },
    {
      id: 2,
      imageUrl: theme2,
      text: 'light',
      button: 'light',
    },
    {
      id: 3,
      imageUrl: theme3,
      text: 'light',
      button: 'light',
    },
    {
      id: 4,
      imageUrl: theme4,
      text: 'light',
      button: 'light',
    },
  ];

  const [selectedThemeId, setSelectedThemeId] = useState(1);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // 현재 선택된 테마
  const currentTheme = themes.find(t => t.id === selectedThemeId);
  const buttonTheme = currentTheme.button;
  const navigate = useNavigate(); //navigate 훅 추가

  // 친구 추가 모달
  const [isFriendSelectOpen, setIsFriendSelectOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);

  const handleFriendListClick = () => {
    setIsFriendSelectOpen(true);
  };

  const handleFriendSelect = (friend) => {
    setSelectedFriend(friend);   
    setIsFriendSelectOpen(false); 
  };


  const isFormValid = title.trim() !== '' && content.trim() !== '';

  const handleSend = () => {
    if (isFormValid) {
      alert("편지를 보냈습니다!");
      // TODO: 실제 전송 로직 추가
    }
  };

  return (
    <>
    <div className="page-container">
      <div className="content-wrapper">
        <div className="glass-card">

          {/* ===== 테마 선택 ===== */}
          <div className="theme-sidebar">
            {themes.map((theme) => (
              <div 
                key={theme.id}
                className={`theme-option ${selectedThemeId === theme.id ? 'active' : ''}`}
                style={{ backgroundImage: `url(${theme.imageUrl})` }}
                onClick={() => setSelectedThemeId(theme.id)}
              />
            ))}
          </div>

          {/* ===== 편지 작성 영역 ===== */}
          <div 
            className={`letter-editor text-${currentTheme.text} btn-${currentTheme.button}`}
            style={{ backgroundImage: `url(${currentTheme.imageUrl})` }}
          >
            <div className="editor-header">
              <h3>편지</h3>
              <button 
                className="close-btn" 
                onClick={() => navigate(-1)} // -1은 '뒤로 가기'
              >✕</button>
            </div>

            <div className="input-group">
              <div className="input-row">
                <span className="label">받는 사람</span>
                <span className={`
                  receiver-name
                  ${selectedFriend ? 'selected' : 'placeholder'}
                  ${currentTheme.text === 'dark' ? 'dark' : 'light'}
                `}
                >
                  {selectedFriend ? selectedFriend.friendNickname : "선택 안 됨"}
                </span>
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

              <div className="input-row content-row">
                  <div className="textarea-container">
                    <textarea 
                      placeholder="내용을 입력하세요"
                      className="text-input"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
              </div>
            </div>

            <div className="editor-footer">
              <button
                className={`send-btn ${buttonTheme}`}
                onClick={handleSend}
                disabled={!isFormValid}
                style={{
                  opacity: isFormValid ? 1 : 0.5,
                  cursor: isFormValid ? 'pointer' : 'not-allowed',
                }}
              >
                보내기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    {/* 친구 선택 모달 */}
    {isFriendSelectOpen && (
        <FriendSelect
          onClose={() => setIsFriendSelectOpen(false)}
          onSelect={handleFriendSelect}
        />
      )}
    </>
  );
};

export default SendLetter;