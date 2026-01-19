import { NavLink, useNavigate } from "react-router-dom";
import DearTimeMini from "../assets/logo.svg";
import { useState, useEffect, useRef, useContext } from "react";
import NotiIcon from "../assets/noti_bell.svg";
import ArrowDown from "../assets/arrow_down.svg";
import DefaultProfile from "../assets/profile.jpg";
import "../styles/header.css";

import friendIcon from "../assets/default_profile.png";
import letterIcon from "../assets/letter.svg";
import capsuleIcon from "../assets/timecapsule.svg";
import ProfileManageModal from "../components/ProfileManageModal";
import { UserContext } from "../context/UserContext";

export default function Header() {
  const itemClass = ({ isActive }) => `item ${isActive ? "active" : ""}`;

  const [notifications, setNotifications] = useState([]);
  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileManageOpen, setIsProfileManageOpen] = useState(false);

  const notiRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  /* =========================
      UTIL
  ========================= */
  const _formatTime = (dateString) => {
    const diff = (new Date() - new Date(dateString)) / 1000 / 60;
    if (diff < 60) return `${Math.floor(diff)}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    return dateString.slice(0, 10).replace(/-/g, ".");
  };

  const handleImgError = (e) => {
    e.target.src = DefaultProfile;
  };

  const _getNotiIcon = (type) => {
    switch (type) {
      case "FRIEND_INVITE":
        return friendIcon;
      case "TIMECAPSULE_OPEN":
      case "TIMECAPSULE_RECEIVED":
        return capsuleIcon;
      case "LETTER_RECEIVED":
        return letterIcon;
      default:
        return friendIcon;
    }
  };

  const _splitNotiContent = (content) => {
    const match = content.match(/(.+님이)\s(.+)/);
    if (!match) return { title: content, body: null };
    return { title: match[1], body: match[2] };
  };

  // 회원가입 일수 계산
  const storedJoinDate = user?.joinDate || localStorage.getItem("joinDate");
  const joinDateObj = storedJoinDate ? new Date(storedJoinDate) : null;

  const daysTogether = joinDateObj
    ? Math.floor((new Date() - joinDateObj) / (1000 * 60 * 60 * 24))
    : 0;

  // 로그아웃
  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await res.json();
      console.log("[Logout] Response:", json);

      if (res.ok && json.success) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("joinDate");

        setUser(null);
        setIsProfileOpen(false);
        navigate("/login");
      } else {
        console.warn("[Logout] Logout failed:", json);
      }
    } catch (err) {
      console.error("[Logout] Error:", err);
    }
  };

  // 클릭 외부 영역 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notiRef.current && !notiRef.current.contains(e.target)) {
        setIsNotiOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 실제 user 기반 프로필 데이터
  const userProfile = {
    nickname: user?.nickname || "사용자",
    bio: user?.bio || "",
    profileImageUrl: user?.profileImageUrl || null,
    joinDays: daysTogether,
  };

  // 친구 요청 처리 (TODO)
  const _handleFriendRequest = async (noti, status) => {
    console.log("[TODO] 친구 요청 처리", { targetUserId: noti.targetId, status });
    setNotifications((prev) =>
      prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
    );
  };

  /* =========================
      RENDER
  ========================= */
  return (
    <>
      <header className="header">
        <div className="inner">
          {/* 왼쪽 */}
          <div className="left-section">
            <NavLink to="/home" className="logo">
              <img src={DearTimeMini} alt="DearTime" />
            </NavLink>

            <nav className="nav">
              <NavLink to="/gallery" className={itemClass}>갤러리</NavLink>
              <NavLink to="/letterbox" className={itemClass}>우체통</NavLink>
              <NavLink to="/timecapsule" className={itemClass}>타임캡슐</NavLink>
              <NavLink to="/friend" className={itemClass}>친구목록</NavLink>
            </nav>
          </div>

          {/* 오른쪽 */}
          <div className="right-section">
            {/* 알림 */}
            <div ref={notiRef} style={{ position: "relative" }}>
              <button
                className={`icon-img-btn ${isNotiOpen ? "is-open" : ""}`}
                onClick={() => {
                  setIsNotiOpen((v) => !v);
                  setIsProfileOpen(false);
                }}
                type="button"
              >
                <img src={NotiIcon} alt="알림" className="noti-img" />
                {notifications.some((n) => !n.isRead) && <span className="red-dot" />}
              </button>
            </div>

            {/* 프로필 */}
            <div ref={profileRef} style={{ position: "relative" }}>
              <div
                className={`profile-trigger ${isProfileOpen ? "is-open" : ""}`}
                onClick={() => {
                  setIsProfileOpen((v) => !v);
                  setIsNotiOpen(false);
                }}
                role="button"
                tabIndex={0}
              >
                <div className="profile-circle-nav">
                  <img
                    src={userProfile.profileImageUrl || DefaultProfile}
                    alt="profile"
                    onError={handleImgError}
                  />
                </div>
                <img
                  src={ArrowDown}
                  alt="arrow"
                  className={`arrow-img ${isProfileOpen ? "up" : ""}`}
                />
              </div>

              {isProfileOpen && (
                <div className="dropdown profile-dropdown">
                  <h2>{userProfile.nickname} 님</h2>
                  <p>Deartime과 함께한지 {userProfile.joinDays}일째</p>

                  <div className="profile-circle-large">
                    <img
                      src={userProfile.profileImageUrl || DefaultProfile}
                      alt="avatar"
                      onError={handleImgError}
                    />
                  </div>

                  <p>{userProfile.bio}</p>
                  <button
                    className="p-btn"
                    onClick={() => {
                      setIsProfileManageOpen(true);
                      setIsProfileOpen(false);
                    }}
                    type="button"
                  >
                    프로필 관리
                  </button>
                  <button className="p-btn" type="button" onClick={handleLogout}>
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 프로필 관리 모달 */}
      {isProfileManageOpen && (
        <ProfileManageModal
          userProfile={userProfile}
          onClose={() => setIsProfileManageOpen(false)}
        />
      )}
    </>
  );
}
