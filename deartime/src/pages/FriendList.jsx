import React, { useMemo, useRef, useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

import bg from "../assets/background_nostar.png";
import finder from "../assets/finder.png";

import "../styles/FriendList.css";
import FriendCard from "../components/FriendCard";
import FriendInvite from "../components/FriendInvite";

// ✅ 목데이터(백엔드 형식)
const mockFriendListResponse = {
  status: 200,
  success: true,
  message: "친구 목록 조회 성공",
  data: {
    count: 13,
    friends: Array.from({ length: 13 }, (_, i) => {
      const idx = i + 1;
      const day = String(idx).padStart(2, "0");
      return {
        userId: 1,
        friendId: idx,
        friendNickname: `Friend ${idx}`,
        friendProfileImageUrl: "profile.jpg",
        friendBio: `Bio ${idx}`,
        status: "accepted",
        requestedAt: `2004-01-${day}T00:00:00`,
      };
    }),
  },
};

export default function FriendList() {
  // const navigate = useNavigate();

  // 친구 초대 모달 상태 추가
  const [showInviteModal, setShowInviteModal] = useState(false);

  // ✅ 검색어
  const [keyword, setKeyword] = useState("");

  // ✅ 친구 목록 state (삭제 반영하려면 state여야 함)
  const [friendsData, setFriendsData] = useState(
    mockFriendListResponse?.data?.friends ?? []
  );

  // ✅ 컨텍스트 메뉴 상태 (Gallery랑 동일 구조)
  const [menu, setMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    targetId: null,
  });

  // ✅ 롱프레스 타이머
  const longPressTimerRef = useRef(null);
  const isLongPressActive = useRef(false);

  const pressTargetElRef = useRef(null);

  // ✅ 검색 필터
  const filteredFriends = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return friendsData;
    return friendsData.filter((f) =>
      (f.friendNickname || "").toLowerCase().includes(k)
    );
  }, [friendsData, keyword]);

  // ✅ 상단 count 텍스트 (검색 결과 기준 원하면 filteredFriends.length로 바꾸면 됨)
  const countText = `${friendsData.length}명의 친구`;

  // ✅ 메뉴 닫기: 바깥 클릭 / ESC / 스크롤 / 리사이즈
  useEffect(() => {
    if (!menu.show) return;

    const close = () => setMenu((prev) => ({ ...prev, show: false }));
    const onKey = (e) => e.key === "Escape" && close();
    const onScroll = () => close();
    const onResize = () => close();

    window.addEventListener("click", close);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("click", close);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [menu.show]);

  // ✅ 롱프레스 시작(모바일/마우스 공통)
  const startPress = (e, id) => {
    if (e.type === "mousedown" && e.button !== 0) return;

    pressTargetElRef.current = e.currentTarget;
    isLongPressActive.current = false;

    longPressTimerRef.current = setTimeout(() => {
      const el = pressTargetElRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      setMenu({ show: true, x: centerX, y: centerY, targetId: id });
      isLongPressActive.current = true;
    }, 500);
  };

  const cancelPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pressTargetElRef.current = null;
  };

  // ✅ 우클릭
  const handleContextMenu = (e, id) => {
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setMenu({ show: true, x: centerX, y: centerY, targetId: id });
    isLongPressActive.current = true;
  };

  // ✅ 삭제
  const handleDelete = () => {
    if (!menu.targetId) return;

    setFriendsData((prev) => prev.filter((f) => f.friendId !== menu.targetId));
    setMenu((prev) => ({ ...prev, show: false }));
  };

  return (
    <div
      className="friendlist-container"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* 상단 영역 */}
      <div className="friend-topbar">
        <div className="friend-topnav">
          <span className="friend-tab active">친구 목록</span>
        </div>

        <div className="friend-topbar-right">
          <button
            type="button"
            className="friend-invite-btn"
            onClick={() => setShowInviteModal(true)}
          >
            친구 신청
          </button>
        </div>
      </div>

      {/* 검색줄 */}
      <div className="friend-search-row">
        <div className="friend-search">
          <input
            className="friend-search-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="친구를 검색하세요"
          />
          <button
            type="button"
            className="friend-search-btn"
            aria-label="search"
          >
            <img className="friend-search-icon" src={finder} alt="" />
          </button>
        </div>

        <div className="friend-count">{countText}</div>
      </div>

      {/* ✅ 오버레이 (Gallery랑 동일: menu.show면 표시) */}
      {menu.show && (
        <div
          className="context-menu-overlay"
          onClick={() => setMenu((prev) => ({ ...prev, show: false }))}
        />
      )}

      {/* ✅ 삭제 메뉴 (1개짜리) */}
      {menu.show && (
        <div
          className="custom-context-menu"
          style={{ top: menu.y, left: menu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="menu-item delete" onClick={handleDelete}>
            <Trash2 size={20} color="#FF4D4D" />
            <span>삭제</span>
          </div>
        </div>
      )}

      {/* ✅ 카드 그리드 */}
      <div className="friend-grid">
        {filteredFriends.map((f) => {
          const isSpotlight = menu.show && menu.targetId === f.friendId;

          return (
            <div
              key={f.friendId}
              className={`friend-item ${isSpotlight ? "spotlight" : ""}`}
              onContextMenu={(e) => handleContextMenu(e, f.friendId)}
              onMouseDown={(e) => startPress(e, f.friendId)}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={(e) => startPress(e, f.friendId)}
              onTouchEnd={cancelPress}
            >
              <FriendCard friend={f} />
            </div>
          );
        })}
      </div>
      {showInviteModal && (
        <FriendInvite onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
}
