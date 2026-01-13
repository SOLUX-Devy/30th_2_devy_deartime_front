import React, { useMemo } from "react";
import defaultProfile from "../assets/profile.jpg";

export default function FriendCard({ friend }) {
  const imageSrc =
    friend?.friendProfileImageUrl === "profile.jpg"
      ? defaultProfile
      : friend?.friendProfileImageUrl || defaultProfile;

  const requestedDate = useMemo(
    () => formatDateYYYYMMDD(friend?.requestedAt),
    [friend?.requestedAt]
  );

  return (
    <>
      <div className="friend-card">
        <div className="friend-avatar-wrap">
          <img
            className="friend-avatar"
            src={imageSrc}
            alt="profile"
            draggable={false}
          />
        </div>

        <div className="friend-name">{friend?.friendNickname ?? "Friend"}</div>
        <div className="friend-date">{requestedDate}</div>
        <div className="friend-bio">{friend?.friendBio ?? ""}</div>
      </div>

      {/* 카드 스타일은 기존처럼 컴포넌트 내부에 유지 */}
      <style>{`
        .friend-card {
          width: 200px;
          height: 250px;
          border-radius: 15px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(14, 119, 188, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 30px;
          box-sizing: border-box;
          cursor: pointer;
          user-select: none;
        }

        .friend-avatar-wrap {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          overflow: hidden;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .friend-avatar {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .friend-name {
          margin-top: 15px;
          font-size: 16px;
          font-weight: 500;
          color: white;
        }

        .friend-date {
          margin-top: 6px;
          font-size: 11px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.75);
        }

        .friend-bio {
          margin-top: 23px;
          width: 160px;
          font-size: 12px;
          font-weight: 300;
          color: rgba(255, 255, 255, 0.85);
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>
    </>
  );
}

function formatDateYYYYMMDD(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}
