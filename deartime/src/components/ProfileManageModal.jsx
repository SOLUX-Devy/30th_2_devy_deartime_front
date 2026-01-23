import { useState, useRef } from "react";
import DefaultProfile from "../assets/profile.jpg";
import "../styles/profileManage.css";
import FriendSelect from "../components/FriendSelect";
import { useUser } from "../context/UserContext";
import EditProfileIcon from "../assets/edit-profile.png";
import { setProxy } from "../api/proxy";

export default function ProfileManageModal({ userProfile, onClose }) {
  const { setUser } = useUser();
  const fileInputRef = useRef(null);

  const originalNickname = userProfile?.nickname || "";

  const [isDelegateSelectOpen, setIsDelegateSelectOpen] = useState(false);
  const [selectedDelegate, setSelectedDelegate] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [nickname, setNickname] = useState(originalNickname);
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [birthDate, setBirthDate] = useState(userProfile?.birthDate || "");

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(
    userProfile?.profileImageUrl || DefaultProfile,
  );

  // 닉네임 중복 확인 상태
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState(null);

  const normalizedNickname = (nickname ?? "").replace(/\u200B/g, "").trim();

  const isNicknameChanged =
    normalizedNickname !==
    (originalNickname ?? "").replace(/\u200B/g, "").trim();

  const isNicknameEmpty = normalizedNickname.length === 0;

  const isSaveDisabled =
    normalizedNickname.length === 0 || !birthDate.trim() || !bio.trim();

  const handleDelegateSelect = (friend) => {
    setSelectedDelegate(friend);
    setIsDelegateSelectOpen(false);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProfileImageFile(file);

    const reader = new FileReader();
    reader.onload = () => setProfileImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCheckNickname = async () => {
    if (!normalizedNickname) {
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
        `/api/users/check-nickname?nickname=${encodeURIComponent(normalizedNickname)}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setNicknameChecked(true);
      setIsNicknameAvailable(json.data.isAvailable);

      alert(
        json.data.isAvailable
          ? "사용 가능한 닉네임입니다."
          : "이미 사용 중인 닉네임입니다.",
      );
    } catch (err) {
      console.error("닉네임 중복 확인 실패", err);
      alert("닉네임 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSave = async () => {
    if (isSaveDisabled) return;

    // 닉네임 변경 시에만 중복 확인
    if (isNicknameChanged) {
      if (!nicknameChecked) {
        alert("닉네임 중복 확인을 해주세요.");
        return;
      }
      if (!isNicknameAvailable) {
        alert("사용할 수 없는 닉네임입니다.");
        return;
      }
    }

    setIsSaving(true);

    const handleSaveProxy = async () => {
      if (!selectedDelegate) return;

      try {
        // 예시: 1년 뒤 만료
        const expiredAt = new Date();
        expiredAt.setFullYear(expiredAt.getFullYear() + 1);
        const expiredAtStr = expiredAt.toISOString().slice(0, 19); // yyyy-MM-ddTHH:mm:ss

        const proxyData = await setProxy(
          selectedDelegate.friendId,
          expiredAtStr,
        );

        alert("대리인이 설정되었습니다.");
        console.log("[Proxy Set]", proxyData);
      } catch (err) {
        console.error("대리인 설정 실패", err);
        alert(err.message);
      }
    };

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      setIsSaving(false);
      return;
    }

    try {
      const formData = new FormData();

      formData.append(
        "request",
        new Blob(
          [
            JSON.stringify({
              nickname: normalizedNickname,
              bio,
              birthDate,
            }),
          ],
          { type: "application/json" },
        ),
      );

      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setUser(json.data);
        alert("프로필이 업데이트 되었습니다.");

        // 대리인 설정
        if (selectedDelegate) {
          await handleSaveProxy();
        }

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
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>

          <div className="profile-manage-header">
            <span>프로필 관리</span>
          </div>
          {/* ⭐ 프로필 이미지 영역 */}
          <div
            className="profile-manage-image"
            onClick={() => fileInputRef.current.click()}
          >
            <img
              src={profileImagePreview}
              alt="profile"
              className="profile-img"
            />
            <div className="edit-icon">
              <img src={EditProfileIcon} alt="edit" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfileImageChange}
              style={{ display: "none" }}
            />
          </div>

          <div className="profile-manage-form">
            <div className="input-group email-group">
              <label>이메일</label>
              <input value={userProfile?.email || ""} disabled />
            </div>

            <div className="input-group">
              <label>닉네임</label>
              <div className="nickname-row">
                <input
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setNicknameChecked(false);
                    setIsNicknameAvailable(null);
                  }}
                />
                <button
                  type="button"
                  onClick={handleCheckNickname}
                  disabled={isNicknameEmpty}
                >
                  중복확인
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>생년월일</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>자기소개</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>

            <div className="delegate-row">
              <span className="delegate-label">대리인</span>
              <button
                className={`action-btn primary ${selectedDelegate ? "selected" : ""}`}
                type="button"
                onClick={() => {
                  if (!selectedDelegate) setIsDelegateSelectOpen(true);
                }}
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
                className={`save-btn ${isSaveDisabled || isSaving ? "disabled" : ""}`}
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
