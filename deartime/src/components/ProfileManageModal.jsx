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

  // 저장 상태
  const [isSaving, setIsSaving] = useState(false);

  // 수정 가능한 상태
  const [nickname, setNickname] = useState(userProfile?.nickname || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(
    userProfile?.profileImageUrl || DefaultProfile
  );

  const handleDelegateSelect = (friend) => {
    setSelectedDelegate(friend);
    setIsDelegateSelectOpen(false);
  };

  const isSaveDisabled = !nickname.trim();

  // 이미지 파일 선택 시
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImageFile(file);

    // 화면에 미리보기
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
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
      const formData = new FormData();
      formData.append("nickname", nickname);
      formData.append("bio", bio);
      if (profileImageFile) formData.append("profileImage", profileImageFile);

      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();
      console.log("[Profile Update] Response:", json);

      if (res.ok && json.success) {
        setUser(json.data);
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
            <img src={profileImagePreview} alt="profile" />
            <input
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
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
                disabled={isSaveDisabled || isSaving}
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
