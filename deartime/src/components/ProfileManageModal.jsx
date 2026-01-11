import { useState } from "react";
import DefaultProfile from "../assets/profile.jpg";
import "../styles/profileManage.css";
import FriendSelect from "../components/FriendSelect";

export default function ProfileManageModal({ userProfile, onClose }) {

  const [isDelegateSelectOpen, setIsDelegateSelectOpen] = useState(false);
  const [selectedDelegate, setSelectedDelegate] = useState(null);

  const handleDelegateSelect = (friend) => {
    setSelectedDelegate(friend);
    setIsDelegateSelectOpen(false);
  };

  return (
    <>
    <div className="profile-manage-overlay">
      <div className="profile-manage-modal">
        {/* 헤더 */}
        <div className="profile-manage-header">
          <span>프로필 관리</span>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {/* 프로필 이미지 */}
        <div className="profile-manage-image">
          <img
            // src={userProfile?.profileImageUrl || DefaultProfile}
            src={DefaultProfile}
            alt="profile"
          />
        </div>

        {/* 폼 */}
        <div className="profile-manage-form">
          {/* 이메일 */}
          <div className="input-group">
            <label>이메일</label>
            <input
              className="disabled-input"
              value={userProfile?.email || ""}
              disabled
            />
          </div>

          {/* 닉네임 */}
          <div className="input-group">
            <label>닉네임</label>
            <input value={userProfile?.nickname || ""} readOnly />
          </div>

          {/* 생년월일 */}
          <div className="input-group">
            <label>생년월일</label>
            <input
                type="date"
                value={userProfile?.birthDate || ""}
                readOnly
            />
        </div>
        
          {/* 자기소개 */}
          <div className="input-group">
            <label>자기소개</label>
            <textarea
              value={userProfile?.bio || ""}
              readOnly
            />
          </div>

          {/* 대리인 */}
            <div className="delegate-row">
            <span className="delegate-label">대리인</span>

            <button
              className="action-btn primary"
              onClick={() => setIsDelegateSelectOpen(true)}
              type="button"
            >
              {selectedDelegate
                ? `대리인: ${selectedDelegate.friendNickname}`
                : "대리인 선택"}
            </button>
            </div>


          {/* 저장 버튼 */}
          <div className="save-row">
            <button className="save-btn">저장</button>
          </div>
        </div>
      </div>
    </div>
    {/* 대리인 선택 모달 */}
    {isDelegateSelectOpen && (
        <FriendSelect
          onClose={() => setIsDelegateSelectOpen(false)}
          onSelect={handleDelegateSelect}
        />
      )}
    </>
  );
}