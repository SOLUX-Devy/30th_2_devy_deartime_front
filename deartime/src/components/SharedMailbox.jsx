import React, { useState, useEffect } from 'react';
import '../styles/SharedMailbox.css';

// 부모(LetterboxPage)로부터 friend와 onBack(닫기 함수)을 받습니다.
const SharedMailbox = ({ friend, onBack }) => {
    // friend 객체에서 필요한 정보를 추출합니다.
    const targetId = friend?.friendId;
    const friendNickname = friend?.friendNickname || "친구";
    const friendProfile = friend?.friendProfileImageUrl || "";

    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

    // 내 닉네임 (내 메시지 여부 판단용)
    const MY_NICKNAME = localStorage.getItem("nickname") || "나";

    useEffect(() => {
        const loadChat = async () => {
            if (!targetId) return;
            try {
                setIsLoading(true);
                const response = await fetch(`${BASE_URL}/api/letters/conversation/${targetId}?sort=createdAt,desc&page=0&size=20`, {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}` }
                });
                const json = await response.json();
                if (json.success) {
                    setMessages(json.data.data || []);
                }
            } catch (e) {
                console.error("대화 로드 실패", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadChat();
    }, [targetId, BASE_URL]);

    // 날짜 포맷팅 (YYYY.MM.DD)
    const formatDate = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    // 시간 포맷팅 (오전/오후 HH:MM)
    const formatTime = (isoString) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) return <div className="loading">대화 기록을 불러오는 중...</div>;

    return (
        <div className="mail-shared-content-wrapper">
            
            {/* 헤더 레이아웃 */}
            <header className="mail-letterbox-header">
                <div className="user-tag">
                    {friendNickname}
                    {/* navigate(-1) 대신 부모가 준 onBack 함수를 실행합니다. */}
                    <button type="button" className="tag-close-btn" onClick={onBack}>×</button>
                </div>
                <span className="letter-count" style={{ color: '#aaa', fontSize: '0.9rem' }}>
                    {messages.length}개의 편지
                </span>
            </header>

            {/* 채팅 리스트 영역 */}
            <div className="chat-list" style={{ marginTop: '20px', paddingBottom: '140px' }}>
                {messages.length === 0 ? (
                    <div className="date-separator">나눈 편지가 없습니다.</div>
                ) : (
                    messages.map((letter, index) => {
                        const isMine = letter.senderNickname === MY_NICKNAME;
                        const showDate = index === 0 || 
                            formatDate(messages[index-1].createdAt) !== formatDate(letter.createdAt);

                        return (
                            <React.Fragment key={letter.letterId}>
                                {showDate && <div className="date-separator">{formatDate(letter.createdAt)}</div>}
                                <div className={`chat-item ${isMine ? 'mine' : 'theirs'}`}>
                                    {!isMine && (
                                        <div className="avatar">
                                            <div className="avatar-circle" style={{ backgroundImage: `url(${friendProfile})`, backgroundSize: 'cover' }} />
                                            <span className="sender-name">{letter.senderNickname}</span>
                                        </div>
                                    )}
                                    <div className="message-bubble">
                                        <p className="message-content">{letter.content || letter.summary}</p>
                                        <span className="message-time">{formatTime(letter.createdAt)}</span>
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default SharedMailbox;