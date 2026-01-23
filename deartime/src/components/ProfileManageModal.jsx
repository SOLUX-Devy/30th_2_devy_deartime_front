import { useState, useRef, useEffect } from "react";
import DefaultProfile from "../assets/default_profile2.png";
import "../styles/profileManage.css";
import FriendSelect from "../components/FriendSelect";
import { useUser } from "../context/UserContext";
import EditProfileIcon from "../assets/edit-profile.png";
import { setProxy } from "../api/proxy";
import { useLocation } from "react-router-dom";

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

  const location = useLocation();
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    onClose();
  }, [location.pathname, onClose]);

  // =========================
  // Nickname check states
  // =========================
  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(null); // null | true | false
  const [nicknameMsg, setNicknameMsg] = useState("");
  const [nicknameMsgType, setNicknameMsgType] = useState(""); // "error" | "success" | ""

  // =========================
  // Derived values (required/dirty)
  // =========================
  const normalizedNickname = (nickname ?? "").replace(/\u200B/g, "").trim();
  const normalizedOriginalNickname = (originalNickname ?? "")
    .replace(/\u200B/g, "")
    .trim();

  const normalizedBio = (bio ?? "").trim();
  const normalizedBirth = (birthDate ?? "").trim();

  const isNicknameChanged = normalizedNickname !== normalizedOriginalNickname;
  const isNicknameEmpty = normalizedNickname.length === 0;

  const isAllFilled =
    normalizedNickname.length > 0 &&
    normalizedBirth.length > 0 &&
    normalizedBio.length > 0;

  const isBioChanged = normalizedBio !== (userProfile?.bio ?? "").trim();
  const isBirthChanged =
    normalizedBirth !== (userProfile?.birthDate ?? "").trim();
  const isProfileImageChanged = !!profileImageFile;

  // delegateId가 userProfile에 없으면 비교가 무의미할 수 있음.
  // 프로젝트에서 delegateId가 없으면 아래 줄을 지워도 됨.
  const isDelegateChanged =
    (selectedDelegate?.friendId ?? null) !== (userProfile?.delegateId ?? null);

  const isDirty =
    isNicknameChanged ||
    isBioChanged ||
    isBirthChanged ||
    isProfileImageChanged ||
    isDelegateChanged;

  // ✅ 저장 버튼: "모든 칸 채움 + 변경사항 있음" 일 때만 활성화
  const isSaveDisabled = !isAllFilled || !isDirty || isSaving;

  // =========================
  // Handlers
  // =========================
  const handleDelegateSelect = (friend) => {
    setSelectedDelegate(friend);
    setIsDelegateSelectOpen(false);
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProfileImageFile(file);

    const reader = new FileReader();
    reader.onload = () => setProfileImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleCheckNickname = async () => {
    if (!normalizedNickname) return; // placeholder + disabled로 유도

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setNicknameChecked(false);
      setNicknameAvailable(null);
      setNicknameMsg("로그인이 필요합니다.");
      setNicknameMsgType("error");
      return;
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(
        `${apiBaseUrl}/api/users/check-nickname?nickname=${encodeURIComponent(
          normalizedNickname,
        )}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setNicknameChecked(true);

      if (json?.data?.isAvailable) {
        setNicknameAvailable(true);
        setNicknameMsg("사용 가능한 닉네임입니다.");
        setNicknameMsgType("success");
      } else {
        setNicknameAvailable(false);
        setNicknameMsg("이미 사용 중인 닉네임입니다.");
        setNicknameMsgType("error");
      }
    } catch (err) {
      console.error("닉네임 중복 확인 실패", err);
      setNicknameChecked(false);
      setNicknameAvailable(null);
      setNicknameMsg("닉네임 확인 중 오류가 발생했습니다.");
      setNicknameMsgType("error");
    }
  };

  const handleSave = async () => {
    if (isSaveDisabled) return;

    // ✅ 닉네임이 변경된 경우에만: 중복확인 + 사용가능(true)여야 API 호출
    if (isNicknameChanged) {
      if (!nicknameChecked) {
        setNicknameMsg("닉네임 중복 확인을 해주세요");
        setNicknameMsgType("error");
        return; // ✅ API 호출 금지
      }
      if (nicknameAvailable !== true) {
        setNicknameMsg("이미 사용 중인 닉네임입니다.");
        setNicknameMsgType("error");
        return; // ✅ API 호출 금지
      }
    }

    setIsSaving(true);

    const handleSaveProxy = async () => {
      if (!selectedDelegate) return;

      try {
        const expiredAt = new Date();
        expiredAt.setFullYear(expiredAt.getFullYear() + 1);
        const expiredAtStr = expiredAt.toISOString().slice(0, 19);

        await setProxy(selectedDelegate.friendId, expiredAtStr);

        // ✅ alert 제거 (요구사항)
        console.log("[Proxy Set] success");
      } catch (err) {
        console.error("대리인 설정 실패", err);
        // 필요하면 여기도 인라인 메시지로 따로 빼야 함(현재 요구사항은 닉네임만)
      }
    };

    const token = localStorage.getItem("accessToken");
    if (!token) {
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

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${apiBaseUrl}/api/users/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setUser(json.data);

        // ✅ 추가: 다른 페이지에서도 즉시 반영되도록 localStorage 최신화
        if (json?.data?.userId)
          localStorage.setItem("userId", String(json.data.userId));
        if (json?.data?.nickname)
          localStorage.setItem("nickname", json.data.nickname);
        if (json?.data?.profileImageUrl)
          localStorage.setItem("profileImageUrl", json.data.profileImageUrl);

        // ✅ 대리인 저장은 1번만
        if (selectedDelegate) {
          await handleSaveProxy();
        }

        onClose();
      } else {
        const msg = json.message || "프로필 업데이트에 실패했습니다.";

        if (
          msg.toLowerCase().includes("닉네임") ||
          msg.toLowerCase().includes("nickname")
        ) {
          setNicknameMsg(msg);
          setNicknameMsgType("error");
        }
      }
    } catch (err) {
      console.error("[Profile Update] Error:", err);
      // ✅ alert 제거 (요구사항)
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

          <div
            className="profile-manage-image"
            onClick={() => fileInputRef.current?.click()}
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
              <input
                className="email-input"
                value={userProfile?.email || ""}
                disabled
              />
            </div>

            <div className="input-group">
              <label>닉네임</label>

              <div className="nickname-row">
                <input
                  value={nickname}
                  placeholder="닉네임을 입력해주세요." // ✅ 요구사항 3
                  onChange={(e) => {
                    setNickname(e.target.value);

                    // ✅ 닉네임 변경 시 중복확인 결과 리셋
                    setNicknameChecked(false);
                    setNicknameAvailable(null);

                    // ✅ 메시지도 리셋 (한 줄만)
                    setNicknameMsg("");
                    setNicknameMsgType("");
                  }}
                />

                <button
                  className="nickname-check-btn"
                  type="button"
                  onClick={handleCheckNickname}
                  disabled={isNicknameEmpty} // ✅ 요구사항 2
                >
                  중복확인
                </button>
              </div>

              {/* ✅ 메시지는 "딱 한 줄"만: nicknameMsg 하나로만 출력 */}
              {nicknameMsg && (
                <div
                  className={`field-msg ${nicknameMsgType} ${nicknameMsg ? "show" : ""}`}
                >
                  {nicknameMsg}
                </div>
              )}
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
                className={`action-btn primary ${
                  selectedDelegate ? "selected" : ""
                }`}
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

      {isDelegateSelectOpen && (
        <FriendSelect
          onClose={() => setIsDelegateSelectOpen(false)}
          onSelect={handleDelegateSelect}
        />
      )}
    </>
  );
}
