// deartime/src/pages/timecapsuleCreate.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/background_star.png";
import noPhoto from "../assets/nophoto.png";
import "../styles/TimeCapsuleCreate.css";

/* ✅ 친구 선택 모달 */
import FriendSelect from "../components/FriendSelect";

function formatTodayYYYYMMDD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function TimeCapsuleCreatePage() {
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  // ✅ 상태
  const [receiver, setReceiver] = useState(null);
  const [openDate, setOpenDate] = useState(formatTodayYYYYMMDD());
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ✅ 내 정보 (state로 들고가기: localStorage가 나중에 채워져도 즉시 반영되게)
  const [myUserId, setMyUserId] = useState(
    Number(localStorage.getItem("userId")) || null,
  );
  const [myNickname, setMyNickname] = useState(
    localStorage.getItem("nickname") ||
      localStorage.getItem("userNickname") ||
      "나",
  );

  // ✅ 나에게로 체크 상태
  const [sendToMe, setSendToMe] = useState(false);

  // (선택) 테마 - UI 없으면 기본 null로 전송
  const [theme, setTheme] = useState(null);

  // ✅ FriendSelect 모달 열림 여부
  const [showFriendSelect, setShowFriendSelect] = useState(false);

  // ✅ 이미지 업로드
  const fileRef = useRef(null);
  const [pickedFile, setPickedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  // ✅ 전송 상태
  const [isSubmitting, setIsSubmitting] = useState(false);

  const imageSrc = previewUrl || noPhoto;

  // ✅ 페이지 진입 시: userId 없으면 /api/users/me로 채우기
  useEffect(() => {
    const hydrateMe = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      // 이미 있으면 굳이 호출 X
      const storedId = Number(localStorage.getItem("userId")) || null;
      const storedNickname =
        localStorage.getItem("nickname") ||
        localStorage.getItem("userNickname") ||
        null;

      if (storedId) setMyUserId(storedId);
      if (storedNickname) setMyNickname(storedNickname);

      if (storedId) return;

      try {
        const res = await fetch(`${apiBaseUrl}/api/users/me`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json().catch(() => null);
        if (!res.ok || json?.success === false) return;

        const me = json?.data;
        if (!me?.userId) return;

        // localStorage 저장
        localStorage.setItem("userId", String(me.userId));
        if (me.nickname) localStorage.setItem("nickname", me.nickname);
        if (me.profileImageUrl)
          localStorage.setItem("profileImageUrl", me.profileImageUrl);

        // state 반영
        setMyUserId(me.userId);
        if (me.nickname) setMyNickname(me.nickname);
      } catch (e) {
        console.error(e);
      }
    };

    hydrateMe();
  }, [apiBaseUrl]);

  // ⚠️ 현재는 이미지 필수로 막아둔 상태(!!pickedFile)
  const isFormValid =
    !!receiver &&
    openDate?.trim() &&
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    !!pickedFile &&
    !isSubmitting;

  const onClickImageBox = () => {
    fileRef.current?.click();
  };

  const onChangeFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const localUrl = URL.createObjectURL(file);
    setPickedFile(file);
    setPreviewUrl(localUrl);
  };

  const onRemoveReceiver = (e) => {
    e.stopPropagation();
    setReceiver(null);
    setSendToMe(false);
  };

  const buildOpenAtISO = (yyyyMMdd) => {
    if (!yyyyMMdd) return "";
    return `${yyyyMMdd}T00:00:00`;
  };

  const onSubmit = async () => {
    if (!isFormValid) return;

    try {
      setIsSubmitting(true);

      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      const payload = {
        title: title.trim(),
        content: content.trim(),
        theme: theme || null,
        receiverId: receiver.id,
        openAt: buildOpenAtISO(openDate),
      };

      const formData = new FormData();
      formData.append(
        "request",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );

      if (pickedFile) {
        formData.append("imageFile", pickedFile);
      }

      const res = await fetch(`${apiBaseUrl}/api/timecapsules`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        alert(json?.message || "타임캡슐 생성 실패");
        return;
      }

      navigate("/timecapsule");
    } catch (e) {
      alert(e?.message || "오류가 발생했습니다.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ 다른 사람(receiver)이 선택돼 있으면 '나에게로' 토글 비활성화
// ✅ 나에게로 비활성 조건 (내 정보 로딩 중 OR 다른 사람 선택됨)
const isSelfToggleDisabled =
  !myUserId || (!!receiver && receiver.id !== myUserId);

  // ✅ 나에게로 토글
const toggleSendToMe = () => {
  if (isSelfToggleDisabled) return;

  const next = !sendToMe;
  setSendToMe(next);

  if (next) {
    setReceiver({
      id: myUserId,
      nickname: `${myNickname} (나)`,
      raw: { friendId: myUserId, friendNickname: `${myNickname} (나)` },
    });
  } else {
    setReceiver(null);
  }
};
  return (
    <div className="tc-create-page" style={{ backgroundImage: `url(${bg})` }}>
      <div className="tc-create-overlay">
        <div className="tc-create-modal">
          {/* 헤더 */}
          <div className="tc-create-modal__header">
            <div className="tc-create-modal__title">TIME CAPSUL</div>
            <button
              type="button"
              className="tc-create-modal__close"
              onClick={() => navigate("/timecapsule")}
              aria-label="close"
            >
              ×
            </button>
          </div>

          {/* 바디 */}
          <div className="tc-create-modal__body">
            {/* 상단 Row */}
            <div className="tc-create-row">
              {/* 받는 사람 */}
              <div className="tc-create-field">
                <div className="tc-create-label">받는 사람</div>

                {/* ✅ 나에게로 체크박스: 다른 사람 선택 중이면 disabled */}
                <div
  className={`tc-create-selfRow ${sendToMe ? "selected" : ""} ${
    isSelfToggleDisabled ? "disabled" : ""
  }`}
  onClick={() => {
    if (isSelfToggleDisabled) return;
    toggleSendToMe();
  }}
  role="button"
  tabIndex={isSelfToggleDisabled ? -1 : 0}
  aria-disabled={isSelfToggleDisabled}
>
  <input
    type="checkbox"
    checked={sendToMe}
    disabled={isSelfToggleDisabled}
    onChange={(e) => {
      e.stopPropagation();
      if (isSelfToggleDisabled) return;
      toggleSendToMe();
    }}
  />
  <span>나에게로</span>
</div>


                <button
                  type="button"
                  className="tc-create-receiver"
                  onClick={() => {
                    // ✅ 친구 고를 땐 '나에게로' 해제
                    setSendToMe(false);
                    setShowFriendSelect(true);
                  }}
                  aria-label="select receiver"
                >
                  {receiver ? (
                    <>
                      <span className="tc-create-receiver__name">
                        {receiver.nickname}
                      </span>
                      <span
                        className="tc-create-receiver__remove"
                        onClick={onRemoveReceiver}
                        role="button"
                        aria-label="remove receiver"
                      >
                        ×
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="tc-create-receiver__placeholder">
                        선택하세요
                      </span>
                      <span className="tc-create-receiver__chev">{">"}</span>
                    </>
                  )}
                </button>
              </div>

              {/* 개봉일 */}
              <div className="tc-create-field">
                <div className="tc-create-label">타임캡슐 개봉일</div>
                <div className="tc-create-dateWrap">
                  <input
                    type="date"
                    className="tc-create-date"
                    value={openDate}
                    min={formatTodayYYYYMMDD()}
                    onChange={(e) => setOpenDate(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 메인 */}
            <div className="tc-create-main">
              <div className="tc-create-left">
                <div
                  className="tc-create-imageBox"
                  onClick={onClickImageBox}
                  role="button"
                  tabIndex={0}
                  aria-label="upload image"
                >
                  <img className="tc-create-image" src={imageSrc} alt="preview" />
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={onChangeFile}
                  />
                </div>
              </div>

              <div className="tc-create-right">
                <input
                  className="tc-create-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="캡슐 제목을 입력하세요"
                />
                <textarea
                  className="tc-create-textarea"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                />
              </div>
            </div>

            {/* 푸터 */}
            <div className="tc-create-footer">
              <button
                type="button"
                className="tc-create-send"
                onClick={onSubmit}
                disabled={!isFormValid}
              >
                {isSubmitting ? "보내는 중..." : "보내기"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ FriendSelect 모달 */}
      {showFriendSelect && (
        <FriendSelect
          onClose={() => setShowFriendSelect(false)}
          onSelect={(friend) => {
            // ✅ 친구 선택하면 '나에게로' 해제 + receiver 세팅
            setSendToMe(false);

            setReceiver({
              id: friend.friendId,
              nickname: friend.friendNickname,
              raw: friend,
            });

            setShowFriendSelect(false);
          }}
        />
      )}
    </div>
  );
}
