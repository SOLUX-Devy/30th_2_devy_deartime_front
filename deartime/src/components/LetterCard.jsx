// src/components/LetterCard.jsx
import React, { useState } from "react";
import "../styles/LetterCard.css";
import LetterDetail from "../components/LetterDetail";

// 배경 이미지 임포트
import bgDarkBlue from "../assets/bg-dark-blue.png";
import bgLightPink from "../assets/bg-light-pink.png";
import bgLightGrey from "../assets/bg-light-grey.png";
import bgLightBlue from "../assets/bg-light-blue.png";

const THEME_IMAGES = {
  DEFAULT: bgDarkBlue,
  PINK: bgLightPink,
  GREY: bgLightGrey,
  BLUE: bgLightBlue,
};

export default function LetterCard({
  data,
  isFocused, // spotlight용 (CSS에서 focused 카드만 밝게)
  onToggleBookmark,
  onMarkAsRead,
}) {
  const {
    senderNickname,
    title,
    summary,
    themeCode,
    sentAt,
    isRead,
    isBookmarked,
  } = data;

  const currentBgImage = THEME_IMAGES[themeCode] || THEME_IMAGES.DEFAULT;

  // 상세보기 상태
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 날짜 포맷
  const formattedDate = sentAt.split("T")[0].replace(/-/g, ".");

  // 즐겨찾기 토글
  const handleBookmarkToggle = (e) => {
    e.stopPropagation();
    // 부모가 넘겨준 함수를 실행합니다.
    onToggleBookmark?.(); 
  };

  // 일반 클릭 → 상세보기
  const handleCardClick = (e) => {
    e.stopPropagation();
    setIsDetailOpen(true);

    // 읽지 않은 편지라면 부모에게 읽음 처리 요청
    if (!isRead) {
      onMarkAsRead?.();
    }
  };
  
  return (
    <>
      <div
        className={`letter-card theme-${themeCode} ${isFocused ? "focused" : ""}`}
        style={{ 
          backgroundImage: `url(${currentBgImage})` ,
          zIndex: isDetailOpen ? 999 : (isFocused ? 100 : 1),
          position: 'relative'
        }}
        onClick={handleCardClick}
      >
        <div className="card-top">
          <span className="sender-info">from. {senderNickname}</span>

          <span
            className={`bookmark-icon ${isBookmarked ? "active" : ""}`} // data에서 온 상태를 직접 사용
            onClick={handleBookmarkToggle}
          />
        </div>

        <div className="card-body">
          <h4 className="title-text">{title}</h4>
          <p className="summary-text">{summary}</p>
        </div>

        <div className="card-bottom">
          <span className="sent-date">{formattedDate}</span>
          <div className="letter-status">
            {!isRead && (
              <span className="unread" style={{ color: "#FF4D4D", fontWeight: "bold" }}>
                안읽음
              </span>
            )}
            {isRead && <span className="read">읽음</span>}
          </div>
        </div>
      </div>

      {/* 상세보기 모달 */}
      <LetterDetail
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        letterId={data.letterId}
        bgImage={currentBgImage}
        themeCode={themeCode}
      />
    </>
  );
}
