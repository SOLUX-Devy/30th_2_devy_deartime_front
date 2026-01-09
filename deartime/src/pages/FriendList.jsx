// src/pages/FriendList.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/background_nostar.png";
import finder from "../assets/finder.png";

import "../styles/FriendList.css";
import FriendCard from "../components/FriendCard";

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
  const navigate = useNavigate();

  // ✅ 검색어
  const [keyword, setKeyword] = useState("");

  // ✅ 친구 목록(accepted만 있다고 했으니 그대로 사용)
  const friends = useMemo(() => {
    const list = mockFriendListResponse?.data?.friends ?? [];
    return list;
  }, []);

  // ✅ 검색 필터
  const filteredFriends = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return friends;
    return friends.filter((f) =>
      (f.friendNickname || "").toLowerCase().includes(k)
    );
  }, [friends, keyword]);

  // ✅ count 표시(검색 결과 기준으로 보여주고 싶으면 filteredFriends.length로 바꾸면 됨)
  const countText = `${mockFriendListResponse.data.count}명의 친구`;

  return (
    <div className="friendlist-container" style={{ backgroundImage: `url(${bg})` }}>
      {/* 상단 영역 */}
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
            placeholder="친구들 검색하세요"
          />
          <button type="button" className="friend-search-btn" aria-label="search">
            <img className="friend-search-icon" src={finder} alt="" />
          </button>
        </div>

        <div className="friend-count">{countText}</div>
      </div>

      {/* ✅ 카드 그리드(제한 없이 아래로) */}
      <div className="friend-grid">
        {filteredFriends.map((f) => (
          <FriendCard
            key={f.friendId}
            friend={f}
            onRequestDelete={(friend) => {
              // TODO: 여기서 삭제 확인 모달 or API 연결
              console.log("delete:", friend.friendId);
            }}
          />
        ))}
      </div>
    </div>
  );
}
