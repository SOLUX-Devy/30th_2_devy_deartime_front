import React, { useState, useEffect } from 'react';
import '../styles/SharedMailbox.css';

const SharedMailbox = ({ selectedFriend, onBack }) => {
    const [chatData, setChatData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // 임시로 지정한 내 닉네임
    const MY_NICKNAME = "송이"; 
    // 임시로 선택된 상대방 정보
    //const SELECTED_USER = "솔룩스";

    useEffect(() => {
        // 실제로는 선택된 친구의 ID를 파라미터로 넣어 호출하게 됨
        fetch('/letterboxMocks/shared.json')
            .then(res => res.json())
            .then(json => {
                setChatData(json.data.data);
                setIsLoading(false);
            });
    }, [selectedFriend]); // 친구가 바뀌면 데이터를 다시 불러오도록 설정

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
                    {/* [수정] 하드코딩 대신 선택된 친구의 닉네임을 표시합니다. */}
                    {selectedFriend?.friendNickname || "알 수 없는 친구"} 
                    <button 
                        type="button" 
                        className="tag-close-btn" 
                        onClick={onBack} // [수정] X 버튼 클릭 시 다시 친구 선택창으로 이동
                    >
                        ×
                    </button>
                </div>
                <span className="letter-count">{chatData.length}개의 편지</span>
            </div>

            <div className="chat-list">
                {chatData.length === 0 ? (
                <div className="empty-message-container">
                    <p className="empty-message">나눈 편지가 없습니다.</p>
                    <p className="empty-sub-message">첫 번째 편지를 보내보세요!</p>
                </div>
            ) : (
                chatData.map((letter, index) => {
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
                                        {/* [팁] 친구의 실제 프로필 이미지가 있다면 여기서 활용 가능합니다. */}
                                        <div 
                                            className="avatar-circle" 
                                            style={{ backgroundImage: `url(${selectedFriend?.friendProfileImageUrl})` }} 
                                        />
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
                }) /*map 끝*/ 
            )} 
        </div>
    </div>
    );
};

export default SharedMailbox;