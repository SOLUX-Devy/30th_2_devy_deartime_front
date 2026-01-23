import { NavLink, useNavigate } from "react-router-dom";
import DearTimeMini from "../assets/logo.svg?url";
import { useState, useEffect, useRef, useContext } from "react";
import NotiIcon from "../assets/noti_bell.svg?url";
import ArrowDown from "../assets/arrow_down.svg?url";
import DefaultProfile from "../assets/default_profile2.png";
import "../styles/header.css";

import ProfileManageModal from "../components/ProfileManageModal";
import { UserContext } from "../context/UserContext";
import { useNotifications } from "../hooks/useNotifications.js";

export default function Header() {
  const itemClass = ({ isActive }) => `item ${isActive ? "active" : ""}`;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileManageOpen, setIsProfileManageOpen] = useState(false);

  const notiRef = useRef(null);
  const profileRef = useRef(null);

  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  useEffect(() => {
    if (user?.userId) {
      localStorage.setItem("lastUserId", String(user.userId));
    }
  }, [user?.userId]);

  const {
    notifications,
    isOpen: isNotiOpen,
    setIsOpen: setIsNotiOpen,
    onClickNotification,
    formatTime,
    getNotiIcon,
    splitNotiContent,
    isFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
  } = useNotifications({
    navigate,
    userId: user?.userId,
  });
  const hasUnreadNoti = notifications.length > 0;

  const handleImgError = (e) => {
    e.target.src = DefaultProfile;
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
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
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("tempToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("joinDate");

        setUser(null);
        setIsProfileOpen(false);
        setIsNotiOpen(false);
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("[Logout Error]", err);
    }
  };

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
  }, [setIsNotiOpen]);

  const joinDateObj = user?.createdAt ? new Date(user.createdAt) : null;
  const daysTogether = joinDateObj
    ? Math.floor((new Date() - joinDateObj) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  const userProfile = {
    nickname: user?.nickname || "사용자",
    bio: user?.bio || "",
    profileImageUrl: user?.profileImageUrl || null,
    joinDays: daysTogether,
    email: user?.email || "",
    birthDate: user?.birthDate || "",
  };

  return (
    <>
      <header className="header">
        <div className="inner">
          {/* LEFT */}
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

          {/* RIGHT */}
          <div className="right-section">
            {/* 🔔 NOTIFICATION */}
            <div ref={notiRef} style={{ position: "relative" }}>
              <button
                className={`icon-img-btn ${isNotiOpen ? "is-open" : ""}`}
                type="button"
                onClick={() => {
                  setIsNotiOpen((v) => !v);
                  setIsProfileOpen(false);
                }}
              >
                <img src={NotiIcon} alt="알림" className="noti-img" />
                {hasUnreadNoti && <span className="red-dot" />}
              </button>

              {isNotiOpen && (
                <div className="noti-dropdown">
                  <p className="noti-title">알림</p>

                  {notifications.length === 0 ? (
                    <p className="noti-empty">아직 알림이 없습니다.</p>
                  ) : (
                    <ul
                      className="noti-list"
                      style={{ listStyle: "none", padding: 0, margin: 0 }}
                    >
                      {notifications.map((noti) => {
                        const type = String(noti.type || "").toUpperCase();
                        if (type === "FRIEND_REQUEST") {
                          console.log("[FRIEND_REQUEST NOTI RAW]", noti);
                        }
                        const { title, body, sub } = splitNotiContent(noti);
                        const friendReq =
                          typeof isFriendRequest === "function"
                            ? isFriendRequest(noti)
                            : String(noti.type || "").toUpperCase() ===
                              "FRIEND_REQUEST";

                        return (
                          <li
                            key={noti.id}
                            className={`noti-item ${
                              noti.isRead ? "read" : "unread"
                            }`}
                            onClick={() => onClickNotification(noti)}
                          >
                            <div className="noti-icon">
                              <img src={getNotiIcon(noti.type)} alt="icon" />
                            </div>

                            <div className="noti-content">
                              <p className="noti-text">{title}</p>
                              {body && (
                                <span className="noti-text">{body}</span>
                              )}
                              {sub && <span className="noti-sub">{sub}</span>}

                              {/* ✅ 친구요청이면: 버튼 + 시간 같은 줄 */}
                              {friendReq ? (
                                <div className="noti-footer">
                                  <div className="noti-actions">
                                    <button
                                      type="button"
                                      className="noti-btn"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        acceptFriendRequest?.(noti);
                                      }}
                                    >
                                      수락
                                    </button>
                                    <button
                                      type="button"
                                      className="noti-btn reject"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        rejectFriendRequest?.(noti);
                                      }}
                                    >
                                      거절
                                    </button>
                                  </div>

                                  <span className="noti-time">
                                    {formatTime(noti.createdAt)}
                                  </span>
                                </div>
                              ) : (
                                /* ✅ 친구요청 아니면: 시간만 */
                                <span className="noti-time">
                                  {formatTime(noti.createdAt)}
                                </span>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* 👤 PROFILE */}
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
