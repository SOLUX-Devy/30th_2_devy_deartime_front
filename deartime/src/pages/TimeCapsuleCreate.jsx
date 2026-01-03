// deartime/src/pages/timecapsuleCreate.jsx
import React, { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/background_star.png";
import noPhoto from "../assets/nophoto.png";
import "../styles/timecapsuleCreate.css";

function formatTodayYYYYMMDD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function TimeCapsuleCreatePage() {
  const navigate = useNavigate();

  // ✅ 받는 사람 목데이터 (나중에 친구 선택 모달로 교체)
  const mockReceiver = useMemo(
    () => ({
      id: 9,
      nickname: "슬록스",
    }),
    []
  );

  // ✅ 상태
  const [receiver, setReceiver] = useState(null); // 처음엔 선택 안 된 상태로 두고 싶으면 null 유지
  const [openDate, setOpenDate] = useState(formatTodayYYYYMMDD());
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ✅ 이미지 업로드 (미리보기)
  const fileRef = useRef(null);
  const [pickedFile, setPickedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const imageSrc = previewUrl || noPhoto;

  const onClickImageBox = () => {
    fileRef.current?.click();
  };

  const onChangeFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 이미지 파일만
    if (!file.type.startsWith("image/")) return;

    // 이전 previewUrl 있으면 해제
    if (previewUrl) URL.revokeObjectURL(previewUrl);

    const localUrl = URL.createObjectURL(file);
    setPickedFile(file);
    setPreviewUrl(localUrl);
  };

  const onRemoveReceiver = (e) => {
    e.stopPropagation(); // 버튼 클릭이 상위 클릭에 영향 안 주게
    setReceiver(null);
  };

  const onMockSelectReceiver = () => {
    // ✅ 지금은 클릭하면 목데이터로 세팅 (나중에 친구 모달에서 선택한 값으로 교체)
    setReceiver(mockReceiver);
  };

  const onSubmit = async () => {
    // ✅ 여기서 나중에 API 붙이면 됨
    // - pickedFile 있으면 FormData 업로드
    // - receiver.id, openDate, title, content 전송

    console.log({
      receiver,
      openDate,
      title,
      content,
      pickedFile,
    });

    // 임시로 뒤로가기
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

                {/* ✅ 화살표 제거하고 캡처처럼 "닉네임 + X" */}
                <button
                  type="button"
                  className="tc-create-receiver"
                  onClick={onMockSelectReceiver}
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
                    <span className="tc-create-receiver__placeholder">
                      선택하세요
                    </span>
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
                    onChange={(e) => setOpenDate(e.target.value)}
                    min={formatTodayYYYYMMDD()} // ✅ 오늘 이전 선택 방지
                  />
                </div>
              </div>
            </div>

            {/* 메인 */}
            <div className="tc-create-main">
              {/* 좌측 이미지 */}
              <div className="tc-create-left">
                <div
                  className="tc-create-imageBox"
                  onClick={onClickImageBox}
                  role="button"
                  tabIndex={0}
                  aria-label="upload image"
                >
                  <img
                    className="tc-create-image"
                    src={imageSrc}
                    alt="preview"
                  />
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={onChangeFile}
                  />
                </div>
              </div>

              {/* 우측 입력 */}
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
              <button type="button" className="tc-create-send" onClick={onSubmit}>
                보내기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
