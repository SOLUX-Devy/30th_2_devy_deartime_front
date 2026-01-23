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

  const initialProxyUserIdRef = useRef(userProfile?.proxyUserId ?? null);

  const [delegateSuccessMsg, setDelegateSuccessMsg] = useState("");

  useEffect(() => {
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
    userProfile?.nickname,
    userProfile?.bio,
    userProfile?.birthDate,
    userProfile?.profileImageUrl,
    userProfile?.proxyUserId,
    userProfile?.proxyNickname,
  ]);

  const [isSaving, setIsSaving] = useState(false);

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
    if (!token) {
      setIsSaving(false);
      return;
    }

    // ✅ 대리인 저장/삭제 처리 (정상 리턴: true면 변경 발생)
    // ✅ 대리인 저장/삭제 처리 (정상 리턴: true면 변경 발생)
const applyProxyChange = async () => {
  // 기존 proxyUserId (삭제 대상)
  // ✅ ref가 가끔 null로 꼬일 수 있으니 userProfile.proxyUserId 우선
    const initialId =
      userProfile?.proxyUserId ?? initialProxyUserIdRef.current ?? null;

    // 현재 선택된 delegate의 id (설정 대상)
    const currentId = selectedDelegate?.friendId ?? null;

    console.log("[Proxy Debug]", {
      initialId,
      currentId,
      ref: initialProxyUserIdRef.current,
      fromProfile: userProfile?.proxyUserId,
    });

    // ✅ 안전 비교(숫자/문자 섞여도 OK)
    const same =
      initialId != null &&
      currentId != null &&
      String(initialId) === String(currentId);

    // 1) 변경 없음: 둘 다 null(없음) 이거나, 둘 다 같은 값이면 끝
    if ((initialId == null && currentId == null) || same) {
      console.log("[Proxy] no change detected");
      return false;
    }

    // 2) 삭제: 기존 있었는데 지금은 없음
    if (initialId != null && currentId == null) {
      await removeProxy(initialId);
      console.log("[Proxy Remove] success");

      // ✅ 즉시 UI/컨텍스트 반영
      setUser((prev) => ({
        ...(prev || {}),
        proxyUserId: null,
        proxyNickname: null,
      }));

      setDelegateSuccessMsg("대리인 저장하고 프로필이 업데이트 되었습니다!");
      return true;
    }

    // 3) 설정/변경: 현재가 있으면 setProxy
    // 설정/변경
    if (currentId != null) {
      const expiredAt = new Date();
      expiredAt.setFullYear(expiredAt.getFullYear() + 1);
      const expiredAtStr = formatLocalDateTime(expiredAt);

      const proxyData = await setProxy(currentId, expiredAtStr);
      console.log("[Proxy Set] success", proxyData);

      // ✅ 여기서 즉시 UI/컨텍스트 반영 (중요)
      setUser((prev) => ({
        ...(prev || {}),
        proxyUserId: proxyData?.proxyUserId ?? currentId,
        proxyNickname: proxyData?.proxyUserNickname ?? selectedDelegate?.friendNickname ?? null,
      }));

      setDelegateSuccessMsg("대리인 저장하고 프로필이 업데이트 되었습니다!");
      return true;
    }

    return false;
  };


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

        if (json?.data?.userId)
          localStorage.setItem("userId", String(json.data.userId));
        if (json?.data?.nickname)
          localStorage.setItem("nickname", json.data.nickname);
        if (json?.data?.profileImageUrl)
          localStorage.setItem("profileImageUrl", json.data.profileImageUrl);

        // ✅ 대리인 변경 적용
        try {
          await applyProxyChange();
        } catch (e) {
          console.error("대리인 처리 실패", e);
        }

        // ✅ 최신 me로 확정 반영
        const me = await refreshMe();
        console.log("[ME AFTER PROXY SAVE]", me);
        if (me) {
          initialProxyUserIdRef.current = me?.proxyUserId ?? null;
        }
        


        // ✅ 초기값 업데이트 + 현재 대리인 표시도 me 기준으로 정렬
        if (me) {
          initialProxyUserIdRef.current = me?.proxyUserId ?? null;

          if (me?.proxyUserId && me?.proxyNickname) {
            setSelectedDelegate({
              friendId: me.proxyUserId,
              friendNickname: me.proxyNickname,
              friendProfileImageUrl: null,
            });
          } else {
            setSelectedDelegate(null);
          }
        }
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDelegate(null);
                      setDelegateSuccessMsg("");
                    }}
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
