import React, { useEffect, useMemo, useRef, useState } from "react";
import defaultProfile from "../assets/profile.jpg";

/**
 * FriendCard
 * - 우클릭 / 롱프레스 시 컨텍스트 메뉴 오픈
 * - props:
 *   - friend: {
 *       friendId,
 *       friendNickname,
 *       friendProfileImageUrl,
 *       friendBio,
 *       requestedAt
 *     }
 *   - onRequestDelete?: (friend) => void
 */
export default function FriendCard({ friend, onRequestDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });

  const pressTimerRef = useRef(null);
  const pressedRef = useRef(false);

  /* =========================
     이미지 src 처리 (로컬 / URL 대응)
     ========================= */
  const imageSrc =
    friend?.friendProfileImageUrl === "profile.jpg"
      ? defaultProfile
      : friend?.friendProfileImageUrl || defaultProfile;

  /* =========================
     날짜 포맷
     ========================= */
  const requestedDate = useMemo(
    () => formatDateYYYYMMDD(friend?.requestedAt),
    [friend]
  );

  const closeMenu = () => setMenuOpen(false);

  /* =========================
     바깥 클릭 / ESC / 스크롤 시 메뉴 닫기
     ========================= */
  useEffect(() => {
    if (!menuOpen) return;

    const onDown = () => closeMenu();
    const onKey = (e) => e.key === "Escape" && closeMenu();
    const onScroll = () => closeMenu();
    const onResize = () => closeMenu();

    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchstart", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchstart", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [menuOpen]);

  const openMenuAt = (x, y) => {
    setMenuPos({ x, y });
    setMenuOpen(true);
  };

  /* =========================
     우클릭
     ========================= */
  const handleContextMenu = (e) => {
    e.preventDefault();
    openMenuAt(e.clientX, e.clientY);
  };

  /* =========================
     롱프레스 (모바일/데스크탑 공통)
     ========================= */
  const handlePointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button === 2) return;

    pressedRef.current = true;

    pressTimerRef.current = setTimeout(() => {
      if (!pressedRef.current) return;
      openMenuAt(e.clientX, e.clientY);
    }, 550);
  };

  const clearPress = () => {
    pressedRef.current = false;
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    closeMenu();
    onRequestDelete?.(friend);
  };

  return (
    <>
      <div
        className="friend-card"
        onContextMenu={handleContextMenu}
        onPointerDown={handlePointerDown}
        onPointerUp={clearPress}
        onPointerLeave={clearPress}
        onPointerCancel={clearPress}
      >
        {/* 프로필 이미지 */}
        <div className="friend-avatar-wrap">
          <img
            className="friend-avatar"
            src={imageSrc}
            alt="profile"
            draggable={false}
          />
        </div>

        {/* 닉네임 */}
        <div className="friend-name">
          {friend?.friendNickname ?? "Friend"}
        </div>

        {/* 날짜 */}
        <div className="friend-date">{requestedDate}</div>

        {/* Bio */}
        <div className="friend-bio">
          {friend?.friendBio ?? ""}
        </div>
      </div>

      {/* 컨텍스트 메뉴 */}
      {menuOpen && (
        <div
          className="friend-card-menu"
          style={{ left: menuPos.x, top: menuPos.y }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="friend-card-menu-item danger"
            onClick={handleDelete}
          >
            친구 삭제
          </button>
          <button
            type="button"
            className="friend-card-menu-item"
            onClick={closeMenu}
          >
            취소
          </button>
        </div>
      )}

      {/* =========================
         CSS (컴포넌트 내부)
         ========================= */}
      <style>{`
        .friend-card {
          width: 200px;
          height: 250px;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(14, 119, 188, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 30px;
          box-sizing: border-box;
          cursor: pointer;
          user-select: none;
        }

        .friend-avatar-wrap {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .friend-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .friend-name {
          margin-top: 15px;
          font-size: 16px;
          font-weight: 500;
          color: white;
        }

        .friend-date {
          margin-top: 6px;
          font-size: 11px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.75);
        }

        .friend-bio {
          margin-top: 23px;
          width: 160px;
          font-size: 12px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.85);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .friend-card-menu {
          position: fixed;
          transform: translate(8px, 8px);
          z-index: 99999;
          background: rgba(12, 16, 28, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 140px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.35);
        }

        .friend-card-menu-item {
          height: 36px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: rgba(255,255,255,0.92);
          font-size: 13px;
          cursor: pointer;
          padding: 0 10px;
          text-align: left;
        }

        .friend-card-menu-item:hover {
          background: rgba(255, 255, 255, 0.08);
        }

        .friend-card-menu-item.danger {
          color: rgba(255, 110, 110, 0.95);
        }

        .friend-card-menu-item.danger:hover {
          background: rgba(255, 110, 110, 0.12);
        }
      `}</style>
    </>
  );
}

/* =========================
   날짜 포맷 유틸
   ========================= */
function formatDateYYYYMMDD(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}
