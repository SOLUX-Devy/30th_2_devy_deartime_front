import { useState } from "react";
import DefaultProfile from "../assets/profile.jpg";
import "../styles/profileManage.css";
import FriendSelect from "../components/FriendSelect";
import { useUser } from "../context/UserContext";

export default function ProfileManageModal({ userProfile, onClose }) {
  const { setUser } = useUser();

  const [isDelegateSelectOpen, setIsDelegateSelectOpen] = useState(false);
  const [selectedDelegate, setSelectedDelegate] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  const [nickname, setNickname] = useState(userProfile?.nickname || "");
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(
    userProfile?.profileImageUrl || DefaultProfile
  );

  // 닉네임 중복 확인 상태
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(null);

  const handleDelegateSelect = (friend) => {
    setSelectedDelegate(friend);
    setIsDelegateSelectOpen(false);
  };

  const isSaveDisabled = !nickname.trim();

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImageFile(file);

    const reader = new FileReader();
    reader.onload = () => setProfileImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // 닉네임 중복 확인
  const handleCheckNickname = async () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      const res = await fetch(
        `/api/users/check-nickname?nickname=${encodeURIComponent(nickname)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || "닉네임 확인 실패");
      }

      const { isAvailable } = json.data;

      setNicknameChecked(true);
      setIsNicknameAvailable(isAvailable);

      alert(
        isAvailable
          ? "사용 가능한 닉네임입니다."
          : "이미 사용 중인 닉네임입니다."
      );
    } catch (err) {
      console.error("닉네임 중복 확인 실패", err);
      alert("닉네임 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSave = async () => {
    if (isSaveDisabled) return;

    if (!nicknameChecked) {
      alert("닉네임 중복 확인을 해주세요.");
      return;
    }

    if (!isNicknameAvailable) {
      alert("사용할 수 없는 닉네임입니다.");
      return;
    }

    setIsSaving(true);

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      setIsSaving(false);
      return;
    }

    try {
      const formData = new FormData();

      const requestData = {
        nickname,
        bio,
      };

      formData.append(
        "request",
        new Blob([JSON.stringify(requestData)], {
          type: "application/json",
        })
      );

      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json();

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
          <div className="profile-manage-header">
            <span>프로필 관리</span>
            <button className="close-btn" onClick={onClose}>✕</button>
          </div>

          <div className="profile-manage-image">
            <img src={profileImagePreview} alt="profile" />
            <input type="file" accept="image/*" onChange={handleProfileImageChange} />
          </div>

          <div className="profile-manage-form">
            <div className="input-group">
              <label>이메일</label>
              <input
                className="disabled-input"
                value={userProfile?.email || ""}
                disabled
              />
            </div>

            {/* 🔹 닉네임 + 중복확인 */}
            <div className="input-group">
              <label>닉네임</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setNicknameChecked(false);
                    setIsNicknameAvailable(null);
                  }}
                />
                <button type="button" onClick={handleCheckNickname}>
                  중복확인
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>생년월일</label>
              <input type="date" value={userProfile?.birthDate || ""} disabled />
            </div>

            <div className="input-group">
              <label>자기소개</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>

            <div className="delegate-row">
              <span className="delegate-label">대리인</span>
              <button
                className={`action-btn primary ${selectedDelegate ? "selected" : ""}`}
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

      {isDelegateSelectOpen && (
        <FriendSelect
          onClose={() => setIsDelegateSelectOpen(false)}
          onSelect={handleDelegateSelect}
        />
      )}
    </>
  );
}
