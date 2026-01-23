// src/components/FriendSelect.jsx
import React, { useEffect, useMemo, useState } from "react";
import finder from "../assets/finder.png";
import "./FriendSelect.css";
import FriendCard from "./FriendCard";
import { jwtDecode } from "jwt-decode"; // ✅ 추가

/**
 * ✅ 토큰에서 userId 후보를 뽑기 (프로젝트마다 키가 다를 수 있어서 여러 후보)
 */
const getUserIdFromToken = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // 흔한 케이스들: userId, id, sub
    const candidate =
      decoded?.userId ?? decoded?.id ?? decoded?.sub ?? decoded?.memberId ?? null;
    return candidate != null ? String(candidate) : null;
  } catch {
    return null;
  }
};

/**
 * ✅ list에서 "내 id" 추론
 * - userId set과 friendId set의 교집합(양쪽에 모두 등장하는 id)이 있으면 그걸 우선 내 id로 봄
 * - 없으면 null
 */
const inferMyIdFromList = (list) => {
  const userIds = new Set(list.map((f) => String(f.userId)));
  const friendIds = new Set(list.map((f) => String(f.friendId)));
  for (const id of userIds) {
    if (friendIds.has(id)) return id;
  }
  return null;
};

/**
 * ✅ 내 userId 확정
 * 우선순위:
 * 1) list에서 추론한 값이 있으면 그게 가장 신뢰도 높음 (서버가 섞어서 줘도 잡힘)
 * 2) localStorage userId가 list 안에 실제로 존재하면 사용
 * 3) 토큰에서 디코드한 값이 list 안에 존재하면 사용
 * 4) 마지막 fallback: localStorage → token
 */
const getMyUserId = (list = []) => {
  const stored = localStorage.getItem("userId");
  const storedStr = stored != null ? String(stored) : null;

  const tokenId = getUserIdFromToken();

  const inferred = inferMyIdFromList(list);
  if (inferred) return inferred;

  const existsInList = (id) => {
    if (!id) return false;
    const s = String(id);
    return list.some(
      (f) => String(f.userId) === s || String(f.friendId) === s,
    );
  };

  if (existsInList(storedStr)) return storedStr;
  if (existsInList(tokenId)) return tokenId;

  return storedStr || tokenId || null;
};

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

export default function FriendSelect({ onClose, onSelect }) {
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [friends, setFriends] = useState([]);
  const [count, setCount] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadFriends = async () => {
      try {
        setIsLoading(true);
        setErrorMsg("");

        const token = localStorage.getItem("accessToken");
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

        const res = await fetch(`${apiBaseUrl}/api/friends`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json().catch(() => ({}));
        const list = json?.data?.friends ?? [];

        console.log("서버가 준 데이터:", list);

        if (!res.ok) {
          throw new Error(json?.message || "친구 목록 조회 실패");
        }

        const myId = getMyUserId(list);
        console.log("[FriendSelect] myId =", myId);

        const normalized = list.map((row) => normalizeRowByMyId(row, myId));
        console.log("정규화 후:", normalized);

        setFriends(normalized);
        setCount(json?.data?.count ?? normalized.length);
      } catch (e) {
        setFriends([]);
        setCount(0);
        setErrorMsg(e?.message || "친구 목록을 불러오지 못했어요.");
      } finally {
        setIsLoading(false);
      }
    };

    loadFriends();
  }, []);

  // ✅ 검색: friendNickname 기준 유지 (정규화 후에도 friendNickname은 '친구 닉네임'이라 가정)
  const filteredFriends = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return friends;
    return friends.filter((f) =>
      (f.friendNickname || "").toLowerCase().includes(k),
    );
  }, [friends, keyword]);

  // ✅ 선택된 친구: friendId 기준
  const selectedFriend = useMemo(() => {
    if (selectedId == null) return null;
    return (
      friends.find((f) => String(f.friendId) === String(selectedId)) || null
    );
  }, [friends, selectedId]);

  const canConfirm = !!selectedFriend;
  const countText = `${count || friends.length}명의 친구`;

  const handleConfirm = () => {
    if (!selectedFriend) return;

    onSelect({
      friendId: selectedFriend.friendId,
      friendNickname: selectedFriend.friendNickname,
      friendProfileImageUrl: selectedFriend.friendProfileImageUrl || null,
    });
  };

  return (
    <div className="fs-overlay" onClick={onClose}>
      <div className="fs-modal" onClick={(e) => e.stopPropagation()}>
        <div className="fs-header">
          <div className="fs-title">친구 선택</div>
          <button
            type="button"
            className="fs-close"
            onClick={onClose}
            aria-label="close"
          >
            ×
          </button>
        </div>

        <div className="fs-topRow">
          <div className="fs-search-row">
            <div className="fs-search">
              <input
                className="fs-search-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="친구들 검색하세요"
              />
              <button type="button" className="fs-search-btn" aria-label="search">
                <img className="fs-search-icon" src={finder} alt="" />
              </button>
            </div>

            <div className="fs-count">{countText}</div>
          </div>

          <button
            type="button"
            className={`fs-confirm-btn ${canConfirm ? "active" : ""}`}
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            친구 선택
          </button>
        </div>

        {isLoading && <div className="fs-state">불러오는 중…</div>}
        {!!errorMsg && !isLoading && (
          <div className="fs-state error">{errorMsg}</div>
        )}

        <div className="fs-grid">
          {!isLoading && !errorMsg && filteredFriends.length === 0 && (
            <div className="fs-state">친구가 없어요.</div>
          )}

          {filteredFriends.map((f) => {
            const isSelected = String(selectedId) === String(f.friendId);

            return (
              <div
                key={f.friendId}
                className={`fs-cardSlot ${isSelected ? "selected" : ""}`}
                onClick={() => setSelectedId(f.friendId)}
                role="button"
                tabIndex={0}
              >
                <div className="fs-cardInner">
                  <FriendCard
                    friend={f}
                    className={isSelected ? "fs-selectedCard" : ""}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
