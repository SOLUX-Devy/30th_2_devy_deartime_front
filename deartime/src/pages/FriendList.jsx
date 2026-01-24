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
  /* 1. 상태 관리 (States) */
  const { user } = useUser(); 
  const [friendsData, setFriendsData] = useState([]); // 보정된 전체 친구 데이터
  const [keyword, setKeyword] = useState("");         // 검색어
  const [isLoading, setIsLoading] = useState(true);   // 로딩 상태

  // 모달 제어
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // 컨텍스트 메뉴 상태
  const [menu, setMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    targetId: null,
  });

  /* 2. 참조 변수 (Refs) - 롱프레스 로직의 핵심 */
  const longPressTimerRef = useRef(null);   // 타이머 핸들
  const pressTargetElRef = useRef(null);    // 누르고 있는 엘리먼트
  const justLongPressedRef = useRef(false); // 롱프레스 직후 클릭 무시용 플래그

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const myId = user?.userId;

  /* 3. API 호출 및 데이터 보정 (Effect) */
  useEffect(() => {
    let isMounted = true;
    if (!myId) return;

    const fetchFriendsData = async () => {
      try {
        setIsLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        
        // ✅ 3. [수정] user.userId 대신 밖에서 가져온 myId를 사용하세요!
        const numericMyId = Number(myId); 

        const res = await fetch(`${apiBaseUrl}/api/friends`, {
          method: "GET",
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const data = await res.json().catch(() => null);

        if (res.ok && isMounted) {
          const rawList = data?.data?.friends ?? [];
          
          const normalizedList = rawList.map(f => {
            // ✅ 4. 여기서도 numericMyId를 사용
            if (Number(f.friendId) === numericMyId) {
              return { ...f, userId: f.friendId, friendId: f.userId };
            }
            return f;
          });

          // ✅ [중복 제거] 동일한 친구가 두 번 들어오는 경우 방지
          const uniqueList = normalizedList.reduce((acc, current) => {
            const isDuplicate = acc.find(item => item.friendId === current.friendId);
            if (!isDuplicate) acc.push(current);
            return acc;
          }, []);

          // 디버깅용 상세 로그 (유지)
          console.log("================================");
          console.log("[FriendList] 보정 완료 / 내 ID:", myId);
          uniqueList.forEach((f, idx) => {
            console.log(`${idx + 1} 👉 나:${f.userId}, 친구:${f.friendId} (${f.friendNickname})`);
          });
          console.log("================================");

          setFriendsData(uniqueList);
        }
      } catch (e) {
        console.error("[FriendList] 에러 발생:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFriendsData();
    return () => { isMounted = false; };
  }, [myId, apiBaseUrl]);

  /* 4. 유틸리티 함수 (Handlers) */

  // 메뉴를 카드 중앙에 띄우는 계산 함수
  const openMenuAtCardCenter = (el, id) => {
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    setMenu({ show: true, x: centerX, y: centerY, targetId: id });
  };

  // 롱프레스 시작 (모바일/데스크톱 공용)
  const startPress = (e, id) => {
    if (e.type === "mousedown" && e.button !== 0) return; // 우클릭 제외

    pressTargetElRef.current = e.currentTarget;
    justLongPressedRef.current = false;

    longPressTimerRef.current = setTimeout(() => {
      const el = pressTargetElRef.current;
      if (!el) return;
      openMenuAtCardCenter(el, id);
      justLongPressedRef.current = true; // 롱프레스 성공 표시
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500); // 0.5초 대기
  };

  // 롱프레스 취소 (손을 뗐을 때)
  const cancelPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pressTargetElRef.current = null;
  };

  // 우클릭 핸들러
  const handleContextMenu = (e, id) => {
    e.preventDefault();
    openMenuAtCardCenter(e.currentTarget, id);
  };

  // 카드 클릭 핸들러 (롱프레스 후의 잔여 클릭 방어)
  const handleCardClick = (e) => {
    if (justLongPressedRef.current) {
      e.stopPropagation();
      justLongPressedRef.current = false;
      return;
    }
    // 메뉴가 열려있을 때 클릭하면 닫기
    if (menu.show) {
      setMenu(prev => ({ ...prev, show: false }));
    }
  };

  // 삭제 버튼 클릭 시 모달 열기
  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (!menu.targetId) return;
    setDeleteTargetId(menu.targetId);
    setShowDeleteConfirm(true);
    setMenu(prev => ({ ...prev, show: false }));
  };

  /* 5. 검색 필터링 (Memoization) */
  const filteredFriends = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return friendsData;
    return friendsData.filter((f) =>
      (f.friendNickname || "").toLowerCase().includes(k)
    );
  }, [friendsData, keyword]);

  return (
    <div className="friendlist-container" style={{ backgroundImage: `url(${bg})` }}>
      {/* 상단바 */}
      <div className="friend-topbar">
        <div className="friend-topnav"><span className="friend-tab active">친구 목록</span></div>
        <div className="friend-topbar-right">
          <button className="friend-invite-btn" onClick={() => setShowInviteModal(true)}>친구 신청</button>
        </div>
      </div>

      {/* 검색창 */}
      <div className="friend-search-row">
        <div className="friend-search">
          <input 
            className="friend-search-input" 
            value={keyword} 
            onChange={(e) => setKeyword(e.target.value)} 
            placeholder="친구를 검색하세요" 
          />
          <button className="friend-search-btn"><img className="friend-search-icon" src={finder} alt="" /></button>
        </div>
        <div className="friend-count">{friendsData.length}명의 친구</div>
      </div>

      {/* 리스트 본문 */}
      {isLoading ? (
        <div className="friend-state">목록을 불러오는 중...</div>
      ) : filteredFriends.length === 0 ? (
        <div className="friend-state">친구가 없습니다.</div>
      ) : (
        <div className="friend-grid">
          {filteredFriends.map((f, index) => (
            <div
              key={`${f.friendId}-${index}`}
              className={`friend-item ${menu.show && menu.targetId === f.friendId ? "spotlight" : ""}`}
              onContextMenu={(e) => handleContextMenu(e, f.friendId)}
              onMouseDown={(e) => startPress(e, f.friendId)}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={(e) => startPress(e, f.friendId)}
              onTouchEnd={cancelPress}
              onClickCapture={(e) => handleCardClick(e, f.friendId)}
            >
              <FriendCard friend={f} />
            </div>
          ))}
        </div>
      )}

      {/* 컨텍스트 메뉴 및 오버레이 */}
      {menu.show && (
        <>
          <div className="context-menu-overlay" onClick={() => setMenu(p => ({...p, show: false}))} />
          <div className="custom-context-menu" style={{ top: menu.y, left: menu.x }} onClick={(e) => e.stopPropagation()}>
            <div className="menu-item delete" onClick={handleDeleteClick}>
              <Trash2 size={20} color="#FF4D4D" />
              <span>삭제</span>
            </div>
          </div>
        </>
      )}

      {/* 모달창들 */}
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