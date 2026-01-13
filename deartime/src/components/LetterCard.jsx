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
  isFocused, // ✅ spotlight용 (CSS에서 focused 카드만 밝게)
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

  // 즐겨찾기 로컬 state
  const [starred, setStarred] = useState(isBookmarked);

  // 상세보기 상태
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 날짜 포맷
  const formattedDate = sentAt.split("T")[0].replace(/-/g, ".");

  // 즐겨찾기 토글
  const handleBookmarkToggle = (e) => {
    e.stopPropagation();
    onToggleBookmark?.(data.letterId);
    setStarred((prev) => !prev);
  };

  // 일반 클릭 → 상세보기
  const handleCardClick = (e) => {
    e.stopPropagation();

    setIsDetailOpen(true);

    if (!data.isRead) {
      onMarkAsRead?.(data.letterId);
    }
  };

  return (
    <>
      <div
        className={`letter-card theme-${themeCode} ${isFocused ? "focused" : ""}`}
        style={{ backgroundImage: `url(${currentBgImage})` }}
        onClick={handleCardClick}
      >
        <div className="card-top">
          <span className="sender-info">from. {senderNickname}</span>

          <span
            className={`bookmark-icon ${starred ? "active" : ""}`}
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
