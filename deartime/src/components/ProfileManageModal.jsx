import { useState, useRef, useEffect, useMemo } from "react";
import DefaultProfile from "../assets/default_profile2.png";
import "../styles/profileManage.css";
import FriendSelect from "../components/FriendSelect";
import { useUser } from "../context/UserContext";
import EditProfileIcon from "../assets/edit-profile.png";
import { setProxy, removeProxy } from "../api/proxy";
import { useLocation } from "react-router-dom";

const formatLocalDateTime = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
};

export default function ProfileManageModal({ userProfile, onClose }) {
  const { setUser } = useUser();
  const fileInputRef = useRef(null);

  const location = useLocation();
  const didMountRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    onClose();
  }, [location.pathname, onClose]);

  const originalNickname = userProfile?.nickname || "";

  const [nickname, setNickname] = useState(originalNickname);
  const [bio, setBio] = useState(userProfile?.bio || "");
  const [birthDate, setBirthDate] = useState(userProfile?.birthDate || "");

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(
    userProfile?.profileImageUrl || DefaultProfile,
  );

  const [selectedDelegate, setSelectedDelegate] = useState(null);
  const [isDelegateSelectOpen, setIsDelegateSelectOpen] = useState(false);

  // ✅ "서버에 저장된 초기 대리인" 기준 (비교/dirty 판단에 사용)
  const initialProxyUserIdRef = useRef(userProfile?.proxyUserId ?? null);

  const [delegateSuccessMsg, setDelegateSuccessMsg] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isSaving) return;

    setNickname(userProfile?.nickname || "");
    setBio(userProfile?.bio || "");
    setBirthDate(userProfile?.birthDate || "");

    setProfileImageFile(null);
    setProfileImagePreview(userProfile?.profileImageUrl || DefaultProfile);

    initialProxyUserIdRef.current = userProfile?.proxyUserId ?? null;

    if (userProfile?.proxyUserId && userProfile?.proxyNickname) {
      setSelectedDelegate({
        friendId: userProfile.proxyUserId,
        friendNickname: userProfile.proxyNickname,
        friendProfileImageUrl: null,
      });
    } else {
      setSelectedDelegate(null);
    }
  }, [
    userProfile, // 의존성을 객체 하나로 묶거나 필요한 필드만 정밀하게 체크
    isSaving     // 저장 상태가 끝난 후 최신 정보를 반영하기 위해 추가
  ]);

  const [nicknameChecked, setNicknameChecked] = useState(false);
  const [nicknameAvailable, setNicknameAvailable] = useState(null);
  const [nicknameMsg, setNicknameMsg] = useState("");
  const [nicknameMsgType, setNicknameMsgType] = useState("");

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

  // ✅ 대리인 변경 여부(저장 버튼 활성화/dirty 판단)
  const isDelegateChanged = useMemo(() => {
    const initialId = initialProxyUserIdRef.current ?? null;
    const currentId = selectedDelegate?.friendId ?? null;
    return String(initialId ?? "") !== String(currentId ?? "");
  }, [selectedDelegate]);

  const isDirty =
    isNicknameChanged ||
    isBioChanged ||
    isBirthChanged ||
    isProfileImageChanged ||
    isDelegateChanged;

  const isSaveDisabled = !isAllFilled || !isDirty || isSaving;

  const handleDelegateSelect = (friend) => {
    setSelectedDelegate(friend);
    setIsDelegateSelectOpen(false);
    setDelegateSuccessMsg("");
  };

  // ✅ 핵심: X는 "즉시 삭제 요청"이 아니라 "UI에서만 제거(저장 시 반영)"로 변경
  const handleDelegateRemoveLocalOnly = (e) => {
    e.stopPropagation();
    setSelectedDelegate(null); // 화면에서만 제거
    setDelegateSuccessMsg("대리인이 삭제되었습니다.");
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
    if (!normalizedNickname) return;

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

  const refreshMe = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    const meRes = await fetch(`${apiBaseUrl}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const meJson = await meRes.json().catch(() => ({}));
    const meData = meJson?.data;

    if (!meRes.ok || !meData) return null;

    setUser(meData);

    if (meData?.userId) localStorage.setItem("userId", String(meData.userId));
    if (meData?.nickname) localStorage.setItem("nickname", meData.nickname);
    if (meData?.profileImageUrl)
      localStorage.setItem("profileImageUrl", meData.profileImageUrl);

    if (meData?.proxyUserId != null)
      localStorage.setItem("proxyUserId", String(meData.proxyUserId));
    else localStorage.removeItem("proxyUserId");

    if (meData?.proxyNickname != null)
      localStorage.setItem("proxyNickname", meData.proxyNickname);
    else localStorage.removeItem("proxyNickname");

    return meData;
  };

  const handleSave = async () => {
    if (isSaveDisabled) return;

    // 1. 닉네임 유효성 검사
    if (isNicknameChanged) {
      if (!nicknameChecked) {
        setNicknameMsg("닉네임 중복 확인을 해주세요");
        setNicknameMsgType("error");
        return;
      }
      if (nicknameAvailable !== true) {
        setNicknameMsg("이미 사용 중인 닉네임입니다.");
        setNicknameMsgType("error");
        return;
      }
    }

    setIsSaving(true);
    const token = localStorage.getItem("accessToken");
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    try {
      // --- [Step 1] 기본 프로필 정보 업데이트 (닉네임, 생일, 자기소개) ---
      const formData = new FormData();
      formData.append(
        "request",
        new Blob(
          [JSON.stringify({ nickname: normalizedNickname, bio, birthDate })],
          { type: "application/json" }
        )
      );
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile);
      }

      const profileRes = await fetch(`${apiBaseUrl}/api/users/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!profileRes.ok) throw new Error("프로필 정보 업데이트 실패");

      // --- [Step 2] 대리인(Proxy) 변경 사항 처리 ---
      const initialId = initialProxyUserIdRef.current ?? null;
      const currentId = selectedDelegate?.friendId ?? null;
      let proxyStatusMsg = "";

      // ✅ 변경이 있을 때만 실행 (문자열 비교로 정확도 높임)
      if (String(initialId ?? "") !== String(currentId ?? "")) {
        
        // A. 기존 대리인 삭제 (삭제만 하거나 다른 사람으로 변경할 때)
        if (initialId !== null) {
          await removeProxy(initialId);
          localStorage.removeItem("proxyUserId");
          localStorage.removeItem("proxyNickname");
        }

        // B. 새로운 대리인 설정
        if (currentId !== null) {
          const expiredAt = new Date();
          expiredAt.setFullYear(expiredAt.getFullYear() + 1);
          const expiredAtStr = formatLocalDateTime(expiredAt);

          const proxyData = await setProxy(currentId, expiredAtStr);
          
          // localStorage 즉시 반영
          localStorage.setItem("proxyUserId", String(proxyData?.proxyUserId ?? currentId));
          localStorage.setItem("proxyNickname", proxyData?.proxyUserNickname ?? selectedDelegate?.friendNickname);
          proxyStatusMsg = "대리인 설정이 완료되었습니다.";
        } else {
          proxyStatusMsg = "대리인이 해제되었습니다.";
        }
      }

      // --- [Step 3] 최종 데이터 동기화 및 상태 업데이트 ---
      // ✅ 모든 API 호출이 끝난 후 refreshMe를 호출해야 DB의 최신값이 반영됩니다.
      const me = await refreshMe();

      if (me) {
        setDelegateSuccessMsg(proxyStatusMsg || "프로필이 업데이트 되었습니다!");
        // 다음 변경 판단을 위해 초기값 Ref 갱신
        initialProxyUserIdRef.current = me.proxyUserId ?? null;
      }

    } catch (err) {
      console.error("[Profile Update Error]:", err);
      setNicknameMsg("저장 중 오류가 발생했습니다.");
      setNicknameMsgType("error");
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
                  placeholder="닉네임을 입력해주세요."
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setNicknameChecked(false);
                    setNicknameAvailable(null);
                    setNicknameMsg("");
                    setNicknameMsgType("");
                  }}
                />

                <button
                  className="nickname-check-btn"
                  type="button"
                  onClick={handleCheckNickname}
                  disabled={isNicknameEmpty}
                >
                  중복확인
                </button>
              </div>

              {nicknameMsg && (
                <div
                  className={`field-msg ${nicknameMsgType} ${
                    nicknameMsg ? "show" : ""
                  }`}
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
                  setIsDelegateSelectOpen(true);
                  setDelegateSuccessMsg("");
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
                    onClick={handleDelegateRemoveLocalOnly}
                    title="대리인 제거(저장 시 반영)"
                  >
                    ✕
                  </span>
                ) : (
                  <span className="delegate-arrow">→</span>
                )}
              </button>
            </div>

            {delegateSuccessMsg && (
              <div className="field-msg success show">{delegateSuccessMsg}</div>
            )}

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
