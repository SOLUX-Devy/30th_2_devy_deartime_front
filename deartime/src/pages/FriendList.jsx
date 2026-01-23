// ==========================
// FriendList.jsx (에러 방지 + 데이터 보정 + 중복 제거)
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

import { useUser } from "../context/UserContext"; 

export default function FriendList() {
  const { user } = useUser();
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

  // ✅ 1. 내 ID 정보를 localStorage의 'userId' 키로 저장
  useEffect(() => {
    if (user?.id !== undefined) {
      localStorage.setItem("userId", String(user.id));
    }
  }, [user]);

  // =========================
  // 친구 목록 조회 및 보정 (useEffect 내부 처리)
  // =========================
  useEffect(() => {
    let isMounted = true; // 메모리 누수 및 세테이트 에러 방지용 플래그

    const fetchFriendsData = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        // ✅ 2. 사용자님이 명시한 'userId' 키 사용
        const storedId = localStorage.getItem("userId");
        const myId = (storedId !== null) ? Number(storedId) : null;

        if (!accessToken || !isMounted) return;

        const res = await fetch(`${apiBaseUrl}/api/friends`, {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = await res.json().catch(() => null);

        if (res.ok && isMounted) {
          const rawList = data?.data?.friends ?? [];
          
          // ✅ 3. 데이터 뒤집힘 보정 (내 ID가 0인 경우도 Number 타입으로 정확히 체크)
          const normalizedList = rawList.map(f => {
            if (myId !== null && Number(f.friendId) === myId) {
              return {
                ...f,
                userId: f.friendId,
                friendId: f.userId,
              };
            }
            return f;
          });

          // ✅ 4. 중복 제거: 보정 후 동일한 friendId가 생기는 경우 하나만 남김
          const uniqueList = normalizedList.reduce((acc, current) => {
            const isDuplicate = acc.find(item => item.friendId === current.friendId);
            if (!isDuplicate) acc.push(current);
            return acc;
          }, []);

          setFriendsData(uniqueList);

          // 디버깅 로그 유지
          console.log("================================");
          console.log("[FriendList] 데이터 보정 및 중복 제거 완료");
          console.log("나의 기준 ID (myId):", myId);
          uniqueList.forEach((f, idx) => {
            console.log(`${idx + 1}번 👉 나: ${f.userId}, 친구: ${f.friendId}`);
          });
          console.log("================================");
        }
      } catch (e) {
        console.error("친구 목록 로드 중 오류 발생:", e);
      }
    };

    fetchFriendsData();

    return () => { isMounted = false; }; // 클린업 함수
  }, [user, apiBaseUrl]);

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
  // 컨텍스트 메뉴 처리
  // =========================
  useEffect(() => {
    if (!menu.show) return;
    const close = () => setMenu((prev) => ({ ...prev, show: false }));
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [menu.show]);

  const startPress = (e, id) => {
    if (e.type === "mousedown" && e.button !== 0) return;
    pressTargetElRef.current = e.currentTarget;
    longPressTimerRef.current = setTimeout(() => {
      const el = pressTargetElRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setMenu({ show: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, targetId: id });
    }, 500);
  };

  const cancelPress = () => { if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); };

  const handleContextMenu = (e, id) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenu({ show: true, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, targetId: id });
  };

  const handleDeleteClick = () => {
    if (!menu.targetId) return;
    setDeleteTargetId(menu.targetId);
    setShowDeleteConfirm(true);
    setMenu((prev) => ({ ...prev, show: false }));
  };

  return (
    <div className="friendlist-container" style={{ backgroundImage: `url(${bg})` }}>
      <div className="friend-topbar">
        <div className="friend-topnav"><span className="friend-tab active">친구 목록</span></div>
        <div className="friend-topbar-right">
          <button type="button" className="friend-invite-btn" onClick={() => setShowInviteModal(true)}>친구 신청</button>
        </div>
      </div>

      <div className="friend-search-row">
        <div className="friend-search">
          <input className="friend-search-input" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="친구를 검색하세요" />
          <button type="button" className="friend-search-btn"><img className="friend-search-icon" src={finder} alt="" /></button>
        </div>
        <div className="friend-count">{countText}</div>
      </div>

      {menu.show && (
        <div className="custom-context-menu" style={{ top: menu.y, left: menu.x }} onClick={(e) => e.stopPropagation()}>
          <div className="menu-item delete" onClick={handleDeleteClick}><Trash2 size={20} color="#FF4D4D" /><span>삭제</span></div>
        </div>
      )}

      <div className="friend-grid">
        {filteredFriends.map((f, index) => (
          // ✅ 5. Key 충돌 방지: 보정된 friendId와 index를 조합하여 고유성 확보
          <div
            key={`${f.friendId}-${index}`}
            className={`friend-item ${menu.show && menu.targetId === f.friendId ? "spotlight" : ""}`}
            onContextMenu={(e) => handleContextMenu(e, f.friendId)}
            onMouseDown={(e) => startPress(e, f.friendId)}
            onMouseUp={cancelPress} onMouseLeave={cancelPress}
            onTouchStart={(e) => startPress(e, f.friendId)} onTouchEnd={cancelPress}
          >
            <FriendCard friend={f} />
          </div>
        ))}
      </div>

      {showInviteModal && <FriendInvite onClose={() => setShowInviteModal(false)} />}
      {showDeleteConfirm && (
        <FriendDelete
          friendId={deleteTargetId}
          friendRow={friendsData.find(f => f.friendId === deleteTargetId)}
          onCancel={() => { setShowDeleteConfirm(false); setDeleteTargetId(null); }}
          onSuccess={(deletedId) => {
            setFriendsData((prev) => prev.filter((f) => f.friendId !== deletedId));
            setShowDeleteConfirm(false); setDeleteTargetId(null);
          }}
        />
      )}
    </div>
  );
}