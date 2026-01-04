import React, {useState} from 'react';
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

    // 즐겨찾기 상태를 로컬 state로 관리 (초기값은 서버/Mock 데이터)
    const [starred, setStarred] = useState(isBookmarked);

    // 토글 핸들러 함수
    const handleBookmarkToggle = (e) => {
        e.stopPropagation(); // 카드 클릭 이벤트(상세페이지 이동 등)와 겹치지 않게 방지
        setStarred(!starred);
    };

    // 날짜 변환 로직 추가 (sentAt이 문자열이므로 변환 필요)
    const formattedDate = sentAt.split('T')[0].replace(/-/g, '.');

    return (
        <div 
            className={`letter-card theme-${themeCode}`}
            // 배경 이미지 스타일 추가
            style={{ backgroundImage: `url(${THEME_IMAGES[themeCode] || THEME_IMAGES.DEFAULT})` }}
        >
            <div className="card-top">
                <span className="sender-info">from. {senderNickname}</span>
                
                {/* 클릭 가능한 별 아이콘 */}
                <span 
                    className={`bookmark-icon ${starred ? 'active' : ''}`} 
                    onClick={handleBookmarkToggle}
                    style={{ 
                        cursor: 'pointer', 
                        color: starred ? '#FFD700' : 'rgba(255, 255, 255, 0.4)',
                        fontSize: '22px'
                    }}
                >
                    {starred ? '★' : '☆'} 
                </span>
            </div>

            <div className="card-body">
                <h4 className="title-text">{title}</h4>
                <p className="summary-text">{summary}</p> 
            </div>

            <div className="card-bottom">
                <span className="sent-date">{formattedDate}</span>
                <div className="letter-status">
                    {!isRead && (
                        <span className="unread" style={{ color: '#FF4D4D', fontWeight: 'bold' }}>
                            안읽음
                        </span>
                    )}
                    {isRead && <span className="read">읽음</span>}
                </div>
            </div>
        </div>
    );
};

export default LetterCard;