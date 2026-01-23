import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom'; // ✅ useNavigate 추가
import '../styles/SharedMailbox.css';

// ✅ selectedFriend 제거 (useParams/useLocation으로 대체)
const SharedMailbox = () => {
    const { id: targetId } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate(); // ✅ 뒤로가기를 위해 추가

    const friendNickname = state?.friendNickname || "친구";
    const friendProfile = state?.friendProfileImageUrl || "";

    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

    // ✅ 내 닉네임 정의 (에러 방지)
    const MY_NICKNAME = localStorage.getItem("nickname") || "나";

    useEffect(() => {
        const loadChat = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`${BASE_URL}/api/letters/conversation/${targetId}?sort=createdAt,desc&page=0&size=20`, {
                    headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}` }
                });
                const json = await response.json();
                if (json.success) {
                    // 서버 데이터 구조에 따라 json.data.friends 혹은 json.data.data 확인 필요
                    setMessages(json.data.data || []);
                }
            } catch (e) {
                console.error("대화 로드 실패", e);
            } finally {
                setIsLoading(false);
            }
        };
        if (targetId) loadChat();
    }, [targetId, BASE_URL]);

    // ✅ 날짜 포맷팅 (YYYY.MM.DD)
    const formatDate = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    // ✅ 시간 포맷팅 (오전/오후 HH:MM) 추가 (에러 방지)
    const formatTime = (isoString) => {
        if (!isoString) return "";
        return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (isLoading) return <div className="loading">대화 기록을 불러오는 중...</div>;

    return (
        <div className="shared-mailbox-container">
            <div className="shared-header">
                <div className="user-tag">
                    {friendNickname} 
                    {/* ✅ onBack 대신 navigate(-1)로 뒤로가기 구현 */}
                    <button type="button" className="tag-close-btn" onClick={() => navigate(-1)}>×</button>
                </div>
                <span className="letter-count">{messages.length}개의 편지</span>
            </div>

            <div className="chat-list">
                {messages.length === 0 ? (
                    <div className="empty-message-container">
                        <p className="empty-message">나눈 편지가 없습니다.</p>
                    </div>
                ) : (
                    // ✅ 최신순 정렬일 경우 채팅 UI를 위해 역순으로 보여줄지 고민해봐야 합니다.
                    messages.map((letter, index) => {
                        const isMine = letter.senderNickname === MY_NICKNAME;
                        // 날짜 구분선 로직 (createdAt 기준)
                        const showDate = index === 0 || 
                            formatDate(messages[index-1].createdAt) !== formatDate(letter.createdAt);

                        return (
                            <React.Fragment key={letter.letterId}>
                                {showDate && (
                                    <div className="date-separator">{formatDate(letter.createdAt)}</div>
                                )}

                                <div className={`chat-item ${isMine ? 'mine' : 'theirs'}`}>
                                    {!isMine && (
                                        <div className="avatar">
                                            <div 
                                                className="avatar-circle" 
                                                style={{ backgroundImage: `url(${friendProfile})` }} 
                                            />
                                            <span className="sender-name">{letter.senderNickname}</span>
                                        </div>
                                    )}
                                    <div className="message-bubble">
                                        {/* 필드명이 content인지 summary인지 확인 필요 */}
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