// deartime/src/pages/timecapsuleCreate.jsx
import React, { useRef, useState } from "react";
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

  // ⚠️ 현재는 이미지 필수로 막아둔 상태(!!pickedFile)
  // API 스펙상 imageFile은 선택이지만, 너 기존 UI 요구대로면 유지해도 됨.
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
  };

  // ✅ openAt: date만 받으니까 임시로 00:00:00 붙여서 ISO 8601 만들기
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

      // ✅ request(JSON) payload 구성
      const payload = {
        title: title.trim(),
        content: content.trim(),
        theme: theme || null, // 선택사항
        receiverId: receiver.id, // ✅ FriendSelect에서 받은 id
        openAt: buildOpenAtISO(openDate),
      };

      // ✅ multipart/form-data 구성
      const formData = new FormData();

      // request는 Text(JSON) + Content-Type: application/json 이어야 함
      formData.append(
        "request",
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );

      // imageFile은 선택사항 (너 UI에서는 필수로 막아두긴 함)
      if (pickedFile) {
        formData.append("imageFile", pickedFile);
      }

      // ✅ 너가 말한 형식 그대로 (Authorization만 헤더에)
      const res = await fetch(`${apiBaseUrl}/api/timecapsules`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        // 서버 message 그대로 보여주기 (400: self / not friend 등)
        alert(json?.message || "타임캡슐 생성 실패");
        return;
      }

      // 성공
      navigate("/timecapsule");
    } catch (e) {
      alert(e?.message || "오류가 발생했습니다.");
      console.error(e);
    } finally {
      setIsSubmitting(false);
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

                <button
                  type="button"
                  className="tc-create-receiver"
                  onClick={() => setShowFriendSelect(true)}
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
            // FriendSelect에서 내려준 friendId / friendNickname 사용
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
