// src/pages/FriendList.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/background_nostar.png";
import finder from "../assets/finder.png";

import "../styles/FriendList.css";
import FriendCard from "../components/FriendCard";

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
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");

  const friends = useMemo(() => mockFriendListResponse?.data?.friends ?? [], []);

  const filteredFriends = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return friends;
    return friends.filter((f) =>
      (f.friendNickname || "").toLowerCase().includes(k)
    );
  }, [friends, keyword]);

  const countText = `${mockFriendListResponse.data.count}명의 친구`;

  return (
    <div
      className="friendlist-container"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* ✅ 1440 전체 영역을 스크롤 컨테이너로 만들기 */}
      <div className="friend-scroll-area">
        {/* 상단 */}
        <div className="friend-topbar">
          <div className="friend-topnav">
            <span className="friend-tab active">친구 목록</span>
          </div>

          <div className="friend-topbar-right">
            <button
              type="button"
              className="friend-invite-btn"
              onClick={() => navigate("/friend/invite")}
            >
              친구 초대
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
              placeholder="친구들 검색하세요"
            />
            <button type="button" className="friend-search-btn" aria-label="search">
              <img className="friend-search-icon" src={finder} alt="" />
            </button>
          </div>

          <div className="friend-count">{countText}</div>
        </div>

        {/* 카드 그리드 */}
        <div className="friend-grid">
          {filteredFriends.map((f) => (
            <FriendCard
              key={f.friendId}
              friend={f}
              onRequestDelete={(friend) => console.log("delete:", friend.friendId)}
            />
          ))}
        </div>

        {/* ✅ 스크롤 맨 아래 여백(그라데이션이 카드 가리지 않게) */}
        <div className="friend-bottom-spacer" />
      </div>

      {/* ✅ 화면 맨 아래 검은 그라데이션 오버레이(항상 고정) */}
      <div className="friend-bottom-gradient" />
    </div>
  );
}
