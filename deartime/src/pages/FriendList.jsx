// src/pages/FriendList.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/background_nostar.png";
import "../styles/FriendList.css";

export default function FriendList() {
  const navigate = useNavigate();

  return (
    <div
      className="friendlist-container"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* 상단 영역 (왼쪽: 세부 네비 / 오른쪽: 친구 초대 버튼) */}
      <div className="friend-topbar">
        {/* 상단 세부 네비 (항목 1개: 친구 목록) */}
        <div className="friend-topnav">
          <span className="friend-tab active">친구 목록</span>
        </div>

        {/* 상단 우측 버튼 */}
        <div className="friend-topbar-right">
          <button
            type="button"
            className="friend-invite-btn"
            onClick={() => navigate("/friend/invite")} // ✅ 이 라우트가 FriendInvite.jsx를 렌더링하도록 라우팅만 연결해두면 됨
          >
            친구 초대
          </button>
        </div>
      </div>

      {/* 아래 내용 영역 (여긴 신경 X 라고 했으니 비워둠) */}
      <div className="friendlist-body">{/* Friend list content here */}</div>
    </div>
  );
}
