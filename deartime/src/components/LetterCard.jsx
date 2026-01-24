// src/components/LetterCard.jsx
import React from "react";
import "../styles/LetterCard.css";

export default function LetterCard({
  data,
  isFocused, // spotlight용 (CSS에서 focused 카드만 밝게)
  onToggleBookmark,
  bgImage
}) {
  const {
    senderNickname,
    title,
    summary,
    sentAt,
    isRead,
    isBookmarked,
  } = data;

  const displaySummary = summary.length > 50 
    ? summary.slice(0, 50) + "..." 
    : summary;

  // 날짜 포맷
  const formattedDate = sentAt.split("T")[0].replace(/-/g, ".");

  // 즐겨찾기 토글
  const handleBookmarkToggle = (e) => {
    e.stopPropagation(); // 부모로 이벤트 전파 차단
    e.preventDefault();  // 브라우저 기본 동작 방지
    onToggleBookmark?.();
  };

  // 일반 클릭 → 상세보기
  // const handleCardClick = (e) => {
  //   e.stopPropagation();
  // };
  
  return (
    <>
      <div
        className={`letter-card ${data.themeCode} ${isFocused ? "focused" : ""}`}
        style={{ 
          backgroundImage: `url(${bgImage})`,
          zIndex: isFocused ? 100 : 1, 
          position: 'relative'
        }}
        //onClick={handleCardClick}
      >
        <div className="card-top">
          <span className="sender-info">From. {senderNickname}</span>

          <span
            className={`bookmark-icon ${isBookmarked ? "active" : ""}`} // data에서 온 상태를 직접 사용
            onClick={handleBookmarkToggle}
          />
        </div>

        <div className="card-body">
          <h4 className="title-text">{title}</h4>
          <p className="summary-text">{displaySummary}</p>
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
    </>
  );
}
