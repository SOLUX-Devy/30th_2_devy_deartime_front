import { useState } from "react";
import DefaultProfile from "../assets/profile.jpg";
import "../styles/profileManage.css";
import FriendSelect from "../components/FriendSelect";
import { useUser } from "../context/UserContext";

export default function ProfileManageModal({ userProfile, onClose }) {
  const { setUser } = useUser();

  // 대리인 모달 상태
  const [isDelegateSelectOpen, setIsDelegateSelectOpen] = useState(false);
  const [selectedDelegate, setSelectedDelegate] = useState(null);

  // 수정 가능한 상태
  const [nickname, setNickname] = useState(userProfile?.nickname || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [profileImageUrl, setProfileImageUrl] = useState(
    userProfile?.profileImageUrl || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const isSaveDisabled = !nickname.trim() || isSaving;

  // 대리인 선택
  const handleDelegateSelect = (friend) => {
    setSelectedDelegate(friend);
    setIsDelegateSelectOpen(false);
  };

  // 저장 버튼 클릭
  const handleSave = async () => {
    if (isSaveDisabled) return;
    setIsSaving(true);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname,
          bio,
          profileImageUrl,
        }),
      });

      const json = await res.json();
      console.log("[Profile Update] Response:", json);

      if (res.ok && json.success) {
        setUser(json.data); // UserContext 갱신
        alert("프로필이 업데이트 되었습니다.");
        onClose();
      } else {
        alert(json.message || "프로필 업데이트에 실패했습니다.");
      }
    } catch (err) {
      console.error("[Profile Update] Error:", err);
      alert("프로필 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 프로필 이미지 에러 시 기본 이미지
  const handleImgError = (e) => {
    e.target.src = DefaultProfile;
  };

  return (
    <>
      <div className="profile-manage-overlay">
        <div className="profile-manage-modal">
          {/* 헤더 */}
          <div className="profile-manage-header">
            <span>프로필 관리</span>
            <button className="close-btn" onClick={onClose}>
              ✕
            </button>
          </div>

          {/* 프로필 이미지 */}
          <div className="profile-manage-image">
            <img
              src={profileImageUrl || DefaultProfile}
              alt="profile"
              onError={handleImgError}
            />
            <input
              type="text"
              value={profileImageUrl}
              onChange={(e) => setProfileImageUrl(e.target.value)}
              placeholder="프로필 이미지 URL"
              className="profile-image-input"
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
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
            </div>

            {/* 생년월일 */}
            <div className="input-group">
              <label>생년월일</label>
              <input
                type="date"
                value={userProfile?.birthDate || ""}
                disabled
              />
            </div>

            {/* 자기소개 */}
            <div className="input-group">
              <label>자기소개</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>

            {/* 대리인 선택 */}
            <div className="delegate-row">
              <span className="delegate-label">대리인</span>
              <button
                className={`action-btn primary ${
                  selectedDelegate ? "selected" : ""
                }`}
                onClick={() => {
                  if (!selectedDelegate) setIsDelegateSelectOpen(true);
                }}
                type="button"
              >
                <span className="delegate-text">
                  {selectedDelegate
                    ? selectedDelegate.friendNickname
                    : "친구 선택"}
                </span>

                {selectedDelegate ? (
                  <span
                    className="delegate-remove"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDelegate(null);
                    }}
                  >
                    ✕
                  </span>
                ) : (
                  <span className="delegate-arrow">→</span>
                )}
              </button>
            </div>

            {/* 저장 버튼 */}
            <div className="save-row">
              <button
                className={`save-btn ${isSaveDisabled ? "disabled" : ""}`}
                disabled={isSaveDisabled}
                onClick={handleSave}
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
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
