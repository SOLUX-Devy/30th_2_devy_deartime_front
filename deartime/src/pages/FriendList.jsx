// ==========================
// FriendList.jsx (GET 연동 + 삭제는 FriendDelete.jsx에서 처리)
// ✅ 팀 규칙: apiBaseUrl = import.meta.env.VITE_API_BASE_URL 사용
// ==========================
import React, { useMemo, useRef, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";

import bg from "../assets/background_nostar.png";
import finder from "../assets/finder.png";

import "../styles/FriendList.css";
import FriendCard from "../components/FriendCard";
import FriendInvite from "../components/FriendInvite";
import FriendDelete from "../components/FriendDelete.jsx";

export default function FriendList() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [friendsData, setFriendsData] = useState([]);

  const [menu, setMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    targetId: null,
  });

  const longPressTimerRef = useRef(null);
  const pressTargetElRef = useRef(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // =========================
  // 친구 목록 조회 API (GET)
  // =========================
  const fetchFriends = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("로그인이 필요합니다.");
        return;
      }

      const res = await fetch(`${apiBaseUrl}/api/friends`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        const list = data?.data?.friends ?? [];
        setFriendsData(list);

        // ✅ 1. 목록 로드 시 API 데이터 내부의 userId와 friendId 쌍을 모두 출력
        console.log("================================");
        console.log("[FriendList] 친구 목록 로드 성공");
        list.forEach((f, idx) => {
          console.log(`${idx + 1}번째 관계 👉 나(userId): ${f.userId}, 친구(friendId): ${f.friendId}`);
        });
        console.log("================================");
      } else {
        alert(data?.message ?? "친구 목록 조회 실패");
      }
    } catch (e) {
      alert("네트워크 오류가 발생했습니다.");
    }
  };

  useEffect(() => {
    fetchFriends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================
  // 검색 필터
  // =========================
  const filteredFriends = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return friendsData;
    return friendsData.filter((f) =>
      (f.friendNickname || "").toLowerCase().includes(k)
    );
  }, [friendsData, keyword]);

  const countText = `${friendsData.length}명의 친구`;

  // =========================
  // 컨텍스트 메뉴 닫기 처리
  // =========================
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

  // =========================
  // 롱프레스 / 우클릭 메뉴 열기
  // =========================
  const startPress = (e, id) => {
    if (e.type === "mousedown" && e.button !== 0) return;

    pressTargetElRef.current = e.currentTarget;

    longPressTimerRef.current = setTimeout(() => {
      const el = pressTargetElRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      setMenu({
        show: true,
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        targetId: id,
      });
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
    setMenu({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      targetId: id,
    });
  };

  // =========================
  // 삭제 클릭 → 확인 모달
  // =========================
  const handleDeleteClick = () => {
    if (!menu.targetId) return;

    // ✅ 2. 클릭한 targetId와 일치하는 객체를 friendsData에서 찾아서 로그 출력
    const targetFriend = friendsData.find(f => f.friendId === menu.targetId);

    console.log("--------------------------------");
    console.log("[FriendList] 삭제 프로세스 시작");
    if (targetFriend) {
      console.log("👉 관계 주인 ID (userId):", targetFriend.userId);
      console.log("👉 삭제 대상 ID (friendId):", targetFriend.friendId);
      console.log("👉 대상 닉네임:", targetFriend.friendNickname);
    }
    console.log("--------------------------------");

    setDeleteTargetId(menu.targetId);
    setShowDeleteConfirm(true);
    setMenu((prev) => ({ ...prev, show: false }));
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
        <FriendDelete
          friendId={deleteTargetId}
          // ✅ 3. FriendDelete 모달에 friendRow 정보를 넘겨주면 내부에서 더 자세히 찍기 좋음
          friendRow={friendsData.find(f => f.friendId === deleteTargetId)}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeleteTargetId(null);
          }}
          onSuccess={(deletedId) => {
            setFriendsData((prev) =>
              prev.filter((f) => f.friendId !== deletedId)
            );
            setShowDeleteConfirm(false);
            setDeleteTargetId(null);
          }}
        />
      )}
    </div>
  );
}