import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import bgStar from "../assets/background_star.png";
import previewImg from "../assets/timecapsule_small.png";
import "../styles/timecapsuleCreate.css";

export default function TimeCapsuleCreate() {
  const navigate = useNavigate();

  // ✅ 임시 친구 목록(나중에 API로 교체)
  const friends = useMemo(
    () => [
      { id: 1, name: "솔룩스 님" },
      { id: 2, name: "이난희 님" },
      { id: 3, name: "나(테스트)" },
    ],
    []
  );

  const today = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const [receiverId, setReceiverId] = useState(friends[0]?.id ?? "");
  const [openDate, setOpenDate] = useState(today);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const onClose = () => {
    navigate("/timecapsule");
  };

  const onSubmit = (e) => {
    e.preventDefault();

    // ✅ 나중에 API 붙일 자리
    console.log({
      receiverId,
      openDate,
      title,
      content,
    });

    navigate("/timecapsule");
  };

  return (
    <div
      className="tc-create-page"
      style={{ backgroundImage: `url(${bgStar})` }}
    >
      {/* ✅ 헤더(App.jsx 공통) 아래 영역에서 중앙 정렬 */}
      <div className="tc-create-overlay">
        <div className="tc-create-modal">
          {/* 상단 타이틀 + 닫기 */}
          <div className="tc-create-modal__header">
            <div className="tc-create-modal__title">TIME CAPSUL</div>

            <button
              type="button"
              className="tc-create-modal__close"
              onClick={onClose}
              aria-label="close"
            >
              ×
            </button>
          </div>

          <form className="tc-create-modal__body" onSubmit={onSubmit}>
            {/* ✅ 받는 사람 / 개봉일 */}
            <div className="tc-create-row">
              <div className="tc-create-field">
                <div className="tc-create-label">받는 사람</div>

                <div className="tc-create-selectWrap">
                  <select
                    className="tc-create-select"
                    value={receiverId}
                    onChange={(e) => setReceiverId(Number(e.target.value))}
                  >
                    {friends.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name}
                      </option>
                    ))}
                  </select>
                  <span className="tc-create-arrow">›</span>
                </div>
              </div>

              <div className="tc-create-field">
                <div className="tc-create-label">타임캡슐 개봉일</div>

                <div className="tc-create-dateWrap">
                  <input
                    type="date"
                    className="tc-create-date"
                    value={openDate}
                    min={today}
                    onChange={(e) => setOpenDate(e.target.value)}
                  />
                  <span className="tc-create-down">▾</span>
                </div>
              </div>
            </div>

            {/* ✅ 왼쪽 이미지 / 오른쪽 입력 */}
            <div className="tc-create-main">
              <div className="tc-create-left">
                <div className="tc-create-imageBox">
                  <img
                    src={previewImg}
                    alt="preview"
                    className="tc-create-image"
                  />
                </div>
              </div>

              <div className="tc-create-right">
                <input
                  className="tc-create-input"
                  placeholder="캡슐 제목을 입력하세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                  className="tc-create-textarea"
                  placeholder="내용을 입력하세요"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>
            </div>

            {/* ✅ 보내기 버튼 */}
            <div className="tc-create-footer">
              <button type="submit" className="tc-create-send">
                보내기
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
