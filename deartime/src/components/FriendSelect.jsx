// src/components/FriendSelect.jsx
import React, { useMemo, useState } from "react";
import finder from "../assets/finder.png";
import "./FriendSelect.css";
import FriendCard from "./FriendCard";
import { mockFriendListResponse } from "../mocks/FriendList"; // ✅ 경로 너 프로젝트에 맞게!

export default function FriendSelect({ onClose, onSelect }) {
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const friends = useMemo(() => {
    return mockFriendListResponse?.data?.friends ?? [];
  }, []);

  const filteredFriends = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return friends;
    return friends.filter((f) =>
      (f.friendNickname || "").toLowerCase().includes(k)
    );
  }, [friends, keyword]);

  const selectedFriend = useMemo(() => {
    if (!selectedId) return null;
    return (
      friends.find((f) => String(f.friendId) === String(selectedId)) || null
    );
  }, [friends, selectedId]);

  const canConfirm = !!selectedFriend;
  const countText = `${mockFriendListResponse?.data?.count ?? friends.length}명의 친구`;

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
            onClick={() => canConfirm && onSelect(selectedFriend)}
          >
            친구 선택
          </button>
        </div>

        {/* 카드 그리드 */}
        <div className="fs-grid">
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
                {/* ✅ FriendCard는 그대로 두고, 슬롯에서 scale로 전체 크기만 줄임 */}
                <div className="fs-cardInner">
                  <FriendCard friend={f} className={isSelected ? "fs-selectedCard" : ""} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
