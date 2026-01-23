import { useState, useRef } from "react";
import DefaultProfile from "../assets/default_profile2.png";
import "../styles/profileManage.css";
import FriendSelect from "../components/FriendSelect";
import { useUser } from "../context/UserContext";
import EditProfileIcon from "../assets/edit-profile.png";
import { setProxy } from "../api/proxy";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";

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

  // 닉네임 중복 확인 상태
  const [nicknameChecked, setNicknameChecked] = useState(false);

  // ✅ 닉네임 안내 문구(인라인 메시지)
  const [nicknameMsg, setNicknameMsg] = useState("");
  const [nicknameMsgType, setNicknameMsgType] = useState(""); // "error" | "success" | ""

  const normalizedNickname = (nickname ?? "").replace(/\u200B/g, "").trim();

  const isNicknameChanged =
    normalizedNickname !==
    (originalNickname ?? "").replace(/\u200B/g, "").trim();

  const isNicknameEmpty = normalizedNickname.length === 0;

  // 저장은 막지 않음(요구사항)
  const isSaveDisabled =
    normalizedNickname.length === 0 || !birthDate.trim() || !bio.trim();

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
    if (!normalizedNickname) {
      setNicknameMsg("닉네임을 입력해주세요.");
      setNicknameMsgType("error");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setNicknameMsg("로그인이 필요합니다.");
      setNicknameMsgType("error");
      return;
    }

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${apiBaseUrl}/api/users/check-nickname?nickname=${encodeURIComponent(normalizedNickname)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setNicknameChecked(true);

      if (json.data.isAvailable) {
        setNicknameMsg("사용 가능한 닉네임입니다.");
        setNicknameMsgType("success");
      } else {
        setNicknameMsg("이미 사용 중인 닉네임입니다.");
        setNicknameMsgType("error");
      }
    } catch (err) {
      console.error("닉네임 중복 확인 실패", err);
      setNicknameChecked(false);
      setNicknameMsg("닉네임 확인 중 오류가 발생했습니다.");
      setNicknameMsgType("error");
    }
  };

  const handleSave = async () => {
    if (isSaveDisabled) return;

    // ✅ 닉네임이 변경됐는데 중복확인 안 했으면 저장은 하되 안내만 띄우기
    if (isNicknameChanged && !nicknameChecked) {
      setNicknameMsg("닉네임 중복 확인 해주세요.");
      setNicknameMsgType("error");
      // 저장을 막지 않으려면 return 하면 안 됨
      // 하지만 서버에서 닉네임 중복/검증 걸릴 가능성이 높아서
      // UX상 여기서 return 하는 게 보통 맞긴 함.
      // 요청대로 "막지 않기"를 지키려면 아래 줄은 주석 처리 유지.
      // return;
    }

    setIsSaving(true);

    const handleSaveProxy = async () => {
      if (!selectedDelegate) return;

      try {
        const expiredAt = new Date();
        expiredAt.setFullYear(expiredAt.getFullYear() + 1);
        const expiredAtStr = expiredAt.toISOString().slice(0, 19);

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

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

      const res = await fetch(`${apiBaseUrl}/api/users/me`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setUser(json.data);
        alert("프로필이 업데이트 되었습니다.");

        if (selectedDelegate) {
          await handleSaveProxy();
        }

        onClose();
      } else {
        // 서버가 닉네임 중복 메시지를 주면, 그걸 닉네임 밑에 띄우기
        const msg = json.message || "프로필 업데이트에 실패했습니다.";
        if (
          msg.toLowerCase().includes("닉네임") ||
          msg.toLowerCase().includes("nickname")
        ) {
          setNicknameMsg(msg);
          setNicknameMsgType("error");
        } else {
          alert(msg);
        }
      }
    } catch (err) {
      console.error("[Profile Update] Error:", err);
      alert("프로필 업데이트 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const shouldAskNicknameCheck =
    isNicknameChanged && normalizedNickname.length > 0 && !nicknameChecked;

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

              {/* ✅ 같은 줄: input + 버튼 */}
              <div className="nickname-row">
                <input
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setNicknameChecked(false);

                    // ✅ 닉네임 바뀌면 메시지 초기화
                    setNicknameMsg("");
                    setNicknameMsgType("");
                  }}
                />

                {/* ✅ 버튼에 클래스 하나 줘서 CSS로 정렬 잡기 쉬움 */}
                <button
                  className="nickname-check-btn"
                  type="button"
                  onClick={handleCheckNickname}
                  disabled={isNicknameEmpty}
                >
                  중복확인
                </button>
              </div>

              {/* ✅ “중복확인 해주세요” 안내 (닉네임 변경 + 미확인 상태) */}
              {shouldAskNicknameCheck && (
                <div className="field-msg error">
                  닉네임 중복 확인 해주세요.
                </div>
              )}

              {/* ✅ 중복확인 결과/에러 메시지 (alert 대신) */}
              {nicknameMsg && (
                <div className={`field-msg ${nicknameMsgType || "error"}`}>
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