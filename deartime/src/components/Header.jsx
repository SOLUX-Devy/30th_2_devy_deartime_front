import { NavLink } from "react-router-dom";
import DearTimeMini from "../assets/logo.svg";
import { useState, useEffect, useRef } from "react";
import NotiIcon from "../assets/noti_bell.svg";
import ArrowDown from "../assets/arrow_down.svg";
import DefaultProfile from "../assets/profile.jpg";
import {
  MOCK_NOTIFICATIONS,
  MOCK_USER_PROFILE,
} from "../mocks/noti_profileDetailResponses.js";
import "../styles/header.css";

import friendIcon from "../assets/default_profile.svg";
import letterIcon from "../assets/letter.svg";
import capsuleIcon from "../assets/timecapsule.svg";
import ProfileManageModal from "../components/ProfileManageModal";

export default function Header() {
  const itemClass = ({ isActive }) => `item ${isActive ? "active" : ""}`;


  const [notifications, setNotifications] = useState(
    MOCK_NOTIFICATIONS?.data?.content || []
  );
  const [userProfile] = useState(MOCK_USER_PROFILE?.data || null);

  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileManageOpen, setIsProfileManageOpen] = useState(false);

  const notiRef = useRef(null);
  const profileRef = useRef(null);

  /* =========================
      UTIL
  ========================= */
  const formatTime = (dateString) => {
    const diff = (new Date() - new Date(dateString)) / 1000 / 60;
    if (diff < 60) return `${Math.floor(diff)}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    return dateString.slice(0, 10).replace(/-/g, ".");
  };

  const handleImgError = (e) => {
    e.target.src = DefaultProfile;
  };

  const getNotiIcon = (type) => {
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

  const splitNotiContent = (content) => {
    const match = content.match(/(.+님이)\s(.+)/);
    if (!match) return { title: content, body: null };
    return { title: match[1], body: match[2] };
  };

  /* =========================
      EFFECT
  ========================= */
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

  /* =========================
      TODO: 친구 요청 처리
      status: accepted | rejected | blocked
  ========================= */
  const handleFriendRequest = async (noti, status) => {
    try {
      console.log("[TODO] 친구 요청 처리", {
        targetUserId: noti.targetId,
        status,
      });

      // TODO: PATCH /api/friends/{targetUserId}
      // body: { status }

      // TODO: PATCH /api/notifications/{noti.id}/read

      // 임시 UI 처리 (연동 전)
      setNotifications((prev) =>
        prev.map((n) => (n.id === noti.id ? { ...n, isRead: true } : n))
      );
    } catch (error) {
      console.error("[TODO] 친구 요청 처리 실패", error);
    }
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
              <NavLink to="/gallery" className={itemClass}>
                갤러리
              </NavLink>
              <NavLink to="/letterbox" className={itemClass}>
                우체통
              </NavLink>
              <NavLink to="/timecapsule" className={itemClass}>
                타임캡슐
              </NavLink>
              <NavLink to="/friend" className={itemClass}>
                친구목록
              </NavLink>
            </nav>
          </div>

          {/* 오른쪽 */}
          <div className="right-section">
            {/* 알림 */}
            <div ref={notiRef} style={{ position: "relative" }}>
              <button
                className="icon-img-btn"
                onClick={() => {
                  setIsNotiOpen((v) => !v);
                  setIsProfileOpen(false);
                }}
                type="button"
              >
                <img src={NotiIcon} alt="알림" className="noti-img" />
                {notifications.some((n) => !n.isRead) && (
                  <span className="red-dot" />
                )}
              </button>

              {isNotiOpen && (
                <div className="dropdown noti-dropdown">
                  <h3 className="noti-title">알림</h3>

                  {notifications.map((noti) => {
                    const { title, body } = splitNotiContent(noti.content);

                    return (
                      <div
                        key={noti.id}
                        className={`noti-item ${!noti.isRead ? "unread" : ""}`}
                      >
                        <div className="noti-icon">
                          <img src={getNotiIcon(noti.type)} alt="알림 아이콘" />
                        </div>

                        <div className="noti-content">
                          <p className="noti-text">{title}</p>
                          {body && <p className="noti-text">{body}</p>}

                          {noti.contentTitle && (
                            <span className="noti-sub">
                              • {noti.contentTitle}
                            </span>
                          )}

                          <div className="noti-footer">
                            {noti.type === "FRIEND_INVITE" && !noti.isRead && (
                              <div className="noti-actions">
                                <button
                                  className="noti-btn accept"
                                  onClick={() => handleFriendRequest(noti, "accepted")}
                                  type="button"
                                >
                                  수락
                                </button>
                                <button
                                  className="noti-btn reject"
                                  onClick={() => handleFriendRequest(noti, "rejected")}
                                  type="button"
                                >
                                  거절
                                </button>
                              </div>
                            )}

                            <span className="noti-time">
                              {formatTime(noti.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 프로필 */}
            <div ref={profileRef} style={{ position: "relative" }}>
              <div
                className="profile-trigger"
                onClick={() => {
                  setIsProfileOpen((v) => !v);
                  setIsNotiOpen(false);
                }}
                role="button"
                tabIndex={0}
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
                  <button className="p-btn" type="button">
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
