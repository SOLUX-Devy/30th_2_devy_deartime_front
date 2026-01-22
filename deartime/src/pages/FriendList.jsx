import React, { useMemo, useRef, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import bg from "../assets/background_nostar.png";
import finder from "../assets/finder.png";

import "../styles/FriendList.css";
import FriendCard from "../components/FriendCard";
import FriendInvite from "../components/FriendInvite";
import FriendDeleteConfirm from "../components/FriendDelete.jsx";

export default function FriendList() {
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [keyword, setKeyword] = useState("");

  // ✅ 목데이터 제거: 빈 배열로 시작
  const [friendsData, setFriendsData] = useState([]);

  const [menu, setMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    targetId: null,
  });

  const longPressTimerRef = useRef(null);
  const isLongPressActive = useRef(false);
  const pressTargetElRef = useRef(null);

  // ✅ 친구 목록 API 연동
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken"); // 저장 키 맞게 수정
        if (!accessToken) {
          alert("로그인이 필요합니다.");
          return;
        }

        const res = await fetch("/api/friends", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data?.message ?? "친구 목록 조회 실패");
          return;
        }

        // ✅ 실데이터로 세팅
        setFriendsData(data?.data?.friends ?? []);
      } catch (e) {
        alert("네트워크 오류가 발생했습니다.");
      }
    };

    fetchFriends();
  }, []);

  const filteredFriends = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return friendsData;
    return friendsData.filter((f) =>
      (f.friendNickname || "").toLowerCase().includes(k)
    );
  }, [friendsData, keyword]);

  const countText = `${friendsData.length}명의 친구`;

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

  const handleContextMenu = (e, id) => {
    e.preventDefault();

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setMenu({ show: true, x: centerX, y: centerY, targetId: id });
    isLongPressActive.current = true;
  };

  const handleDeleteClick = () => {
    if (!menu.targetId) return;

    setDeleteTargetId(menu.targetId);
    setShowDeleteConfirm(true);
    setMenu((prev) => ({ ...prev, show: false }));
  };

  // (현재는 프론트에서만 삭제 반영) - 삭제 API 있으면 여기서 호출하면 됨
  const confirmDelete = () => {
    setFriendsData((prev) => prev.filter((f) => f.friendId !== deleteTargetId));
    setShowDeleteConfirm(false);
    setDeleteTargetId(null);
  };

  return (
    <div
      className="friendlist-container"
      style={{ backgroundImage: `url(${bg})` }}
    >
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

      <div className="friend-search-row">
        <div className="friend-search">
          <input
            className="friend-search-input"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="친구를 검색하세요"
          />
          <button type="button" className="friend-search-btn" aria-label="search">
            <img className="friend-search-icon" src={finder} alt="" />
          </button>
        </div>

        <div className="friend-count">{countText}</div>
      </div>

      {menu.show && (
        <div
          className="context-menu-overlay"
          onClick={() => setMenu((prev) => ({ ...prev, show: false }))}
        />
      )}

      {menu.show && (
        <div
          className="custom-context-menu"
          style={{ top: menu.y, left: menu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="menu-item delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick();
            }}
          >
            <Trash2 size={20} color="#FF4D4D" />
            <span>삭제</span>
          </div>
        </div>
      )}

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

      {showDeleteConfirm && (
        <FriendDeleteConfirm
          onConfirm={confirmDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </div>
  );
}
