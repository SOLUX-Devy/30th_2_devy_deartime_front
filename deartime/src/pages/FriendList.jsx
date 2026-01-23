// ==========================
// FriendList.jsx (GET 연동 + 삭제는 FriendDelete.jsx에서 처리)
// ✅ 팀 규칙: apiBaseUrl = import.meta.env.VITE_API_BASE_URL 사용
// ==========================
import React, { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { Trash2 } from "lucide-react";

import bg from "../assets/background_nostar.png";
import finder from "../assets/finder.png";

import "../styles/FriendList.css";
import FriendCard from "../components/FriendCard";
import FriendInvite from "../components/FriendInvite";
import FriendDelete from "../components/FriendDelete.jsx";

/**
 * ✅ "내 id가 userId에 오도록" row 정규화
 */
const normalizeRowByMyId = (row, myId) => {
  if (!myId) return row;

  const u = String(row.userId);
  const f = String(row.friendId);
  const m = String(myId);

  if (u === m) return row;

  if (f === m) {
    return {
      ...row,
      userId: row.friendId,
      friendId: row.userId,
    };
  }

  return row;
};

export default function FriendList() {
  const [showInviteModal, setShowInviteModal] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetRow, setDeleteTargetRow] = useState(null);

  const [keyword, setKeyword] = useState("");
  const [friendsData, setFriendsData] = useState([]);

  const [menu, setMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    targetId: null, // ✅ 삭제 대상 friendId (정규화 기준: 내 id는 userId)
    targetRow: null,
  });

  const longPressTimerRef = useRef(null);
  const pressTargetElRef = useRef(null);

  // ✅ "메뉴 열자마자 바로 닫히는" 문제 방지용 (다음 클릭 1회 무시)
  const ignoreNextCloseClickRef = useRef(false);

  // ✅ 팀 규칙: env base url 사용
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // ✅ 내 id
  const myId = Number(localStorage.getItem("userId")) || null;

  // =========================
  // 친구 목록 조회 API (GET) + 정규화
  // =========================
  const fetchFriends = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        alert("로그인이 필요합니다.");
        return;
      }

      const res = await fetch(`${apiBaseUrl}/api/friends`, {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message ?? "친구 목록 조회 실패");
        return;
      }

      const raw = data?.data?.friends ?? [];
      const normalized = raw.map((row) => normalizeRowByMyId(row, myId));
      setFriendsData(normalized);
    } catch (e) {
      alert("네트워크 오류가 발생했습니다.");
    }
  }, [apiBaseUrl, myId]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  // =========================
  // 검색 필터
  // =========================
  const filteredFriends = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return friendsData;
    return friendsData.filter((f) =>
      (f.friendNickname || "").toLowerCase().includes(k),
    );
  }, [friendsData, keyword]);

  const countText = `${friendsData.length}명의 친구`;

  // =========================
  // 컨텍스트 메뉴 닫기 처리
  // (메뉴 열자마자 닫히는 click 1회는 무시)
  // =========================
  useEffect(() => {
    if (!menu.show) return;

    const close = () => {
      if (ignoreNextCloseClickRef.current) {
        ignoreNextCloseClickRef.current = false;
        return;
      }
      setMenu((prev) => ({ ...prev, show: false }));
    };

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
  // 롱프레스 / 우클릭 메뉴 열기 (row를 받아야 함)
  // =========================
  const openMenuAtEl = (el, row) => {
    if (!el || !row) return;

    const rect = el.getBoundingClientRect();

    // ✅ "열자마자 닫힘" 방지: 다음 click 한 번은 close 무시
    ignoreNextCloseClickRef.current = true;

    setMenu({
      show: true,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      targetId: row.friendId, // ✅ 정규화 기준: 상대방
      targetRow: row,
    });
  };

  const startPress = (e, row) => {
    // 좌클릭만 (PC)
    if (e.type === "mousedown" && e.button !== 0) return;

    pressTargetElRef.current = e.currentTarget;

    longPressTimerRef.current = setTimeout(() => {
      const el = pressTargetElRef.current;
      openMenuAtEl(el, row);
    }, 500);
  };

  const cancelPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pressTargetElRef.current = null;
  };

  const handleContextMenu = (e, row) => {
    e.preventDefault();
    openMenuAtEl(e.currentTarget, row);
  };

  // =========================
  // 삭제 클릭 → 확인 모달
  // =========================
  const handleDeleteClick = () => {
    if (!menu.targetId || !menu.targetRow) return;

    setDeleteTargetRow(menu.targetRow);
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
        {filteredFriends.map((row) => {
          const isSpotlight = menu.show && menu.targetId === row.friendId;

          return (
            <div
              key={row.friendId}
              className={`friend-item ${isSpotlight ? "spotlight" : ""}`}
              onContextMenu={(e) => handleContextMenu(e, row)}
              onMouseDown={(e) => startPress(e, row)}
              onMouseUp={cancelPress}
              onMouseLeave={cancelPress}
              onTouchStart={(e) => startPress(e, row)}
              onTouchEnd={cancelPress}
            >
              <FriendCard friend={row} />
            </div>
          );
        })}
      </div>

      {showInviteModal && (
        <FriendInvite onClose={() => setShowInviteModal(false)} />
      )}

      {showDeleteConfirm && (
        <FriendDelete
          friendId={deleteTargetRow?.friendId}
          friendRow={deleteTargetRow}
          friendsList={friendsData}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setDeleteTargetRow(null);
          }}
          onSuccess={(deletedId) => {
            setFriendsData((prev) => prev.filter((r) => r.friendId !== deletedId));
            setShowDeleteConfirm(false);
            setDeleteTargetRow(null);
          }}
        />
      )}
    </div>
  );
}
