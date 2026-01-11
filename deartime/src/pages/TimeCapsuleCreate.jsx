// deartime/src/pages/timecapsuleCreate.jsx
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/background_star.png";
import noPhoto from "../assets/nophoto.png";
import "../styles/timecapsuleCreate.css";

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

  // ✅ 상태
  const [receiver, setReceiver] = useState(null);
  const [openDate, setOpenDate] = useState(formatTodayYYYYMMDD());
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ✅ FriendSelect 모달 열림 여부
  const [showFriendSelect, setShowFriendSelect] = useState(false);

  // ✅ 이미지 업로드
  const fileRef = useRef(null);
  const [pickedFile, setPickedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const imageSrc = previewUrl || noPhoto;

  const isFormValid =
    !!receiver &&
    openDate?.trim() &&
    title.trim().length > 0 &&
    content.trim().length > 0 &&
    !!pickedFile;

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

  const onSubmit = () => {
    if (!isFormValid) return;

    console.log({
      receiver,
      openDate,
      title,
      content,
      pickedFile,
    });

    navigate("/timecapsule");
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
                보내기
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
            // ✅ 여기서 receiver 구조를 "nickname"으로 통일
            setReceiver({
              id: friend.friendId,
              nickname: friend.friendNickname,
              profileImageUrl: friend.friendProfileImageUrl,
              bio: friend.friendBio,
              requestedAt: friend.requestedAt,
              raw: friend,
            });
            setShowFriendSelect(false);
          }}
        />
      )}
    </div>
  );
}
