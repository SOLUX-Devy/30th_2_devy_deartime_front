import React from 'react';
import '../styles/LetterCard.css';
import bgDarkBlue from '../assets/bg-dark-blue.png';
import bgLightPink from '../assets/bg-light-pink.png';
import bgLightGrey from '../assets/bg-light-grey.png';

const THEME_IMAGES = {
    DEFAULT: bgDarkBlue, 
    PINK: bgLightPink,
    GREY: bgLightGrey
};

const LetterCard = ({ data }) => {
    const {
        senderNickname,
        title,
        summary,
        themeCode,
        sentAt,
        isRead,
        isBookmarked
    } = data;

    // 1. 날짜 변환 로직 추가 (sentAt이 문자열이므로 변환 필요)
    const formattedDate = sentAt.split('T')[0].replace(/-/g, '.');

    return (
        <div 
            className={`letter-card theme-${themeCode}`}
            // 2. 배경 이미지 스타일 추가
            style={{ backgroundImage: `url(${THEME_IMAGES[themeCode] || THEME_IMAGES.DEFAULT})` }}
        >
            <div className="card-top">
                <span className="sender-info">from. {senderNickname}</span>
                {/* 3. 즐겨찾기 별 표시 추가 */}
                {isBookmarked && <span className="bookmark-icon">★</span>}
            </div>

            <div className="card-body">
                <h4 className="title-text">{title}</h4>
                <p className="summary-text">{summary}</p> 
            </div>

            <div className="card-bottom">
                <span className="sent-date">{formattedDate}</span>
                <span className={isRead ? 'status-read' : 'status-unread'}>
                    {isRead ? '읽음' : '안 읽음'}
                </span>
            </div>
        </div>
    );
};

export default LetterCard;