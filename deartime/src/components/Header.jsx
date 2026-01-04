import { NavLink } from "react-router-dom";
import DearTimeMini from "../assets/logo.svg";
import { useState, useEffect, useRef } from "react";
import NotiIcon from "../assets/noti_bell.svg"; 
import ArrowDown from "../assets/arrow_down.svg"; 
import DefaultProfile from "../assets/profile.jpg"; 
import { MOCK_NOTIFICATIONS, MOCK_USER_PROFILE } from "../mocks/noti_profileDetailResponses.js";
import "../styles/header.css";

export default function Header() {
  const itemClass = ({ isActive }) => `item ${isActive ? "active" : ""}`;

  // 🔹 목데이터 (읽기 전용)
  const [notifications] = useState(
    MOCK_NOTIFICATIONS?.data?.content || []
  );

  const [userProfile] = useState(
    MOCK_USER_PROFILE?.data || null
  );

  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notiRef = useRef(null);
  const profileRef = useRef(null);

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

  const handleImgError = (e) => {
    e.target.src = DefaultProfile;
  };

  return (
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
            <NavLink to="/freind" className={itemClass}>친구목록</NavLink>
          </nav>
        </div>

        {/* 오른쪽 */}
        <div className="right-section">
          {/* 알림 */}
          <div ref={notiRef} style={{ position: "relative" }}>
            <button
              className="icon-img-btn"
              onClick={() => {
                setIsNotiOpen(!isNotiOpen);
                setIsProfileOpen(false);
              }}
            >
              <img src={NotiIcon} alt="알림" className="noti-img" />
              {notifications.some(n => !n.isRead) && <span className="red-dot" />}
            </button>
          </div>

          {/* 프로필 */}
          <div ref={profileRef} style={{ position: "relative" }}>
            <div
              className="profile-trigger"
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotiOpen(false);
              }}
            >
              <div className="profile-circle-nav">
                <img
                  src={userProfile?.profileImageUrl || DefaultProfile}
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

            {isProfileOpen && userProfile && (
              <div className="dropdown profile-dropdown">
                <h2>{userProfile.nickname} 님</h2>
                <p>Deartime과 함께한지 {userProfile.joinDays || 0}일째</p>

                <div className="profile-circle-large">
                  <img
                    src={userProfile.profileImageUrl || DefaultProfile}
                    alt="avatar"
                    onError={handleImgError}
                  />
                </div>

                <p>{userProfile.bio}</p>
                <button className="p-btn">프로필 관리</button>
                <button className="p-btn">로그아웃</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}