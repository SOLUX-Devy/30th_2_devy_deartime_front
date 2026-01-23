import { NavLink, useNavigate } from "react-router-dom";
import DearTimeMini from "../assets/logo.svg?url";
import { useState, useEffect, useRef, useContext } from "react";
import NotiIcon from "../assets/noti_bell.svg?url";
import ArrowDown from "../assets/arrow_down.svg?url";
import DefaultProfile from "../assets/default_profile2.png";
import "../styles/header.css";

import ProfileManageModal from "../components/ProfileManageModal";
import { UserContext } from "../context/UserContext";
// [FIX] 훅 import 추가
import { useNotifications } from "../hooks/useNotifications"; 

export default function Header() {
  const itemClass = ({ isActive }) => `item ${isActive ? "active" : ""}`;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileManageOpen, setIsProfileManageOpen] = useState(false);

  const notiRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);

  /* =========================
      UTIL & HOOKS
  ========================= */
  const handleImgError = (e) => {
    e.target.src = DefaultProfile;
  };

  // 훅 사용 및 변수명 매핑
  const {
    notifications,
    isOpen: isNotiOpen,       
    setIsOpen: setIsNotiOpen, 
    hasUnread,
    onClickNotification,
    formatTime,
    getNotiIcon,
    splitNotiContent,
  } = useNotifications({ navigate, userId: user?.userId });

  // 회원가입 일수 계산
  const joinDateObj = user?.createdAt ? new Date(user.createdAt) : null;

  const daysTogether = joinDateObj
    ? Math.floor((new Date() - joinDateObj) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  // 로그아웃
  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/");
      return;
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${apiBaseUrl}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();

      if (res.ok && json.success) {
        localStorage.clear();
        setUser(null);
        setIsProfileOpen(false);
        navigate("/login");
      }
    } catch (err) {
      console.error("[Logout] Error:", err);
    }
  };

  // 외부 클릭 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      // 알림창 닫기
      if (notiRef.current && !notiRef.current.contains(e.target)) {
        setIsNotiOpen(false);
      }
      // 프로필창 닫기
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsNotiOpen]); // 의존성 배열 추가

  const userProfile = {
    nickname: user?.nickname || "사용자",
    bio: user?.bio || "",
    profileImageUrl: user?.profileImageUrl || null,
    joinDays: daysTogether,
    email: user?.email || "",
    birthDate: user?.birthDate || "",
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
            
            {/* 알림 섹션 */}
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
                {/* 읽지 않은 알림이 있으면 빨간 점 표시 (선택사항) */}
                {hasUnread && <span className="red-dot"></span>}
              </button>

              {isNotiOpen && (
                <div className="noti-dropdown">
                  {notifications.length === 0 ? (
                    <p className="noti-empty">아직 알림이 없습니다.</p>
                  ) : (
                    <ul className="noti-list">
                      {notifications.map((noti) => {
                        const { title, body } = splitNotiContent(noti.content);

                        return (
                          <li
                            key={noti.id}
                            className={`noti-item ${noti.isRead ? "read" : "unread"}`}
                            onClick={() => onClickNotification(noti)}
                          >
                            <div className="noti-icon">
                              <img src={getNotiIcon(noti.type)} alt="icon" 
                              onError={(e) => {
    console.log("[ICON LOAD FAIL]", noti.type, e.currentTarget.src);
  }}/>
                            </div>

                            <div className="noti-content">
                              <p className="noti-text">{title}</p>

                              {body && <span className="noti-sub">{body}</span>}
                            </div>
                            <span className="noti-time">{formatTime(noti.createdAt)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* 프로필 섹션 */}
            <div ref={profileRef} style={{ position: "relative" }}>
              <div
                className={`profile-trigger ${isProfileOpen ? "is-open" : ""}`}
                onClick={() => {
                  setIsProfileOpen((v) => !v);
                  setIsNotiOpen(false);
                }}
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
                  >
                    프로필 관리
                  </button>
                  <button className="p-btn" onClick={handleLogout}>
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {isProfileManageOpen && (
        <ProfileManageModal
          userProfile={userProfile}
          onClose={() => setIsProfileManageOpen(false)}
        />
      )}
    </>
  );
}