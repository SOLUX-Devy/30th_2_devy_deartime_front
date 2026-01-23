// src/components/FriendSelect.jsx
import React, { useEffect, useMemo, useState } from "react";
import finder from "../assets/finder.png";
import "./FriendSelect.css";
import FriendCard from "./FriendCard";

export default function FriendSelect({ onClose, onSelect }) {
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState(null); // ✅ 이제 userId를 담는다

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

        const json = await res.json();
        console.log("서버가 준 진짜 데이터:", json.data.friends);

        if (!res.ok) {
          throw new Error(json?.message || "친구 목록 조회 실패");
        }

        const list = json?.data?.friends ?? [];
        setFriends(list);
        setCount(json?.data?.count ?? list.length);
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

  // ✅ 검색: friendNickname 기준 유지
  const filteredFriends = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return friends;
    return friends.filter((f) =>
      (f.friendNickname || "").toLowerCase().includes(k)
    );
  }, [friends, keyword]);

  // ✅ 선택된 친구 찾기: userId 기준
  const selectedFriend = useMemo(() => {
    if (selectedId == null) return null;
    return friends.find((f) => String(f.userId) === String(selectedId)) || null;
  }, [friends, selectedId]);

  const canConfirm = !!selectedFriend;
  const countText = `${count || friends.length}명의 친구`;

  const handleConfirm = () => {
    if (!selectedFriend) return;

    // ✅ 외부로는 friendId 라는 이름으로 보내더라도, 값은 "상대 유저ID(userId)"를 보내기
    onSelect({
      friendId: selectedFriend.userId,
      friendNickname: selectedFriend.friendNickname,
    });
  };

  return (
    <div className="fs-overlay" onClick={onClose}>
      <div className="fs-modal" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
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

        {/* 검색줄 + 친구 수 + 우측 버튼 */}
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

        {/* 상태 */}
        {isLoading && <div className="fs-state">불러오는 중…</div>}
        {!!errorMsg && !isLoading && (
          <div className="fs-state error">{errorMsg}</div>
        )}

        {/* 카드 그리드 */}
        <div className="fs-grid">
          {!isLoading && !errorMsg && filteredFriends.length === 0 && (
            <div className="fs-state">친구가 없어요.</div>
          )}

          {filteredFriends.map((f) => {
            // ✅ 선택 비교도 userId 기준
            const isSelected = String(selectedId) === String(f.userId);

            return (
              <div
                key={f.userId} // ✅ 중복 key 문제 해결
                className={`fs-cardSlot ${isSelected ? "selected" : ""}`}
                onClick={() => setSelectedId(f.userId)} // ✅ 선택값도 userId
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
