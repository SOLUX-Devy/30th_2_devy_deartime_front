import React, { useState, useEffect } from 'react';
import '../styles/SharedMailbox.css';

const SharedMailbox = () => {
    const [chatData, setChatData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // 임시로 지정한 내 닉네임
    const MY_NICKNAME = "송이"; 
    // 임시로 선택된 상대방 정보
    const SELECTED_USER = "솔룩스";

    useEffect(() => {
        fetch('/letterboxMocks/shared.json')
            .then(res => res.json())
            .then(json => {
                setChatData(json.data.data);
                setIsLoading(false);
            });
    }, []);

    // 날짜 포맷팅 함수 (YYYY.MM.DD)
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    if (isLoading) return <div className="loading">대화 기록을 불러오는 중...</div>;

    return (
        <div className="shared-mailbox-container">
            {/* 선택된 유저 태그 영역 */}
            <div className="shared-header">
                <div className="user-tag">
                    {SELECTED_USER} 
                    <button 
                        type="button" 
                        className="tag-close-btn" 
                        onClick={() => console.log('태그 삭제 클릭됨!')}
                    >
                        ×
                    </button>
                </div>
                <span className="letter-count">{chatData.length}개의 편지</span>
            </div>

            <div className="chat-list">
                {chatData.map((letter, index) => {
                    const isMine = letter.senderNickname === MY_NICKNAME;
                    const showDate = index === 0 || 
                        formatDate(chatData[index-1].sentAt) !== formatDate(letter.sentAt);

                    return (
                        <React.Fragment key={letter.letterId}>
                            {/* 날짜 구분선: 이전 메시지와 날짜가 다를 때만 표시 */}
                            {showDate && (
                                <div className="date-separator">
                                    {formatDate(letter.sentAt)}
                                </div>
                            )}

                            <div className={`chat-item ${isMine ? 'mine' : 'theirs'}`}>
                                {!isMine && (
                                    <div className="avatar">
                                        {/* 프로필 이미지가 있다면 img 태그 사용 */}
                                        <div className="avatar-circle" />
                                        <span className="sender-name">{letter.senderNickname}</span>
                                    </div>
                                )}
                                <div className="message-bubble">
                                    <p className="message-content">{letter.summary}</p>
                                    <span className="message-time">{formatDate(letter.sentAt)}</span>
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default SharedMailbox;