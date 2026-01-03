// src/pages/TimeCapsuleDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import bg from "../assets/background_star.png";
import "../styles/timecapsuleDetail.css";
import noPhoto from "../assets/nophoto.png";
import { mockDetailResponseById } from "../mocks/timecapsuleDetailResponses";

function formatYYYYMMDD(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function formatDateInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function TimeCapsuleDetail() {
  const navigate = useNavigate();
  const { capsuleId } = useParams();

  const [loading, setLoading] = useState(true);
  const [capsule, setCapsule] = useState(null);

  useEffect(() => {
    setLoading(true);

    const idNum = Number(capsuleId);
    const response = mockDetailResponseById[idNum];

    // ✅ 없는 id면 목록으로
    if (!response || !response.success || !response.data) {
      navigate("/timecapsule");
      return;
    }

    // ✅ 접근 불가면 상세 자체 차단 (목록으로)
    if (response.data.canAccess === false) {
      navigate("/timecapsule");
      return;
    }

    setCapsule(response.data);
    setLoading(false);
  }, [capsuleId, navigate]);

  const createdText = useMemo(
    () => (capsule?.createdAt ? formatYYYYMMDD(capsule.createdAt) : ""),
    [capsule?.createdAt]
  );

  const openAtText = useMemo(
    () => (capsule?.openAt ? formatDateInput(capsule.openAt) : ""),
    [capsule?.openAt]
  );

  const imgSrc = useMemo(() => {
    if (!capsule) return noPhoto;

    // ✅ canAccess=true면 상세는 열리니까,
    // opened 여부랑 상관없이 "imageUrl 있으면 보여주고 없으면 noPhoto"
    return capsule.imageUrl || noPhoto;
  }, [capsule]);

  return (
    <div className="tc-detail-page" style={{ backgroundImage: `url(${bg})` }}>
      <div className="tc-detail-overlay">
        <div className="tc-detail-modal">
          <div className="tc-detail-modal__header">
            <div className="tc-detail-modal__title">TIME CAPSULE</div>
            <button
              type="button"
              className="tc-detail-modal__close"
              onClick={() => navigate(-1)}
              aria-label="close"
            >
              ×
            </button>
          </div>

          <div className="tc-detail-modal__body">
            {loading ? (
              <div className="tc-detail-loading">불러오는 중...</div>
            ) : (
              <>
                {/* 상단 고정 정보 */}
                <div className="tc-detail-row">
                  <div className="tc-detail-field">
                    <div className="tc-detail-label">발신자</div>
                    <div className="tc-detail-value">
                      {capsule?.senderNickname || "-"}
                    </div>
                  </div>

                  <div className="tc-detail-field">
                    <div className="tc-detail-label">개봉일</div>
                    <input
                      className="tc-detail-date"
                      type="date"
                      value={openAtText}
                      readOnly
                    />
                  </div>
                </div>

                {/* 메인 */}
                <div className="tc-detail-main">
                  <div className="tc-detail-left">
                    <div className="tc-detail-imageBox">
                      <img className="tc-detail-image" src={imgSrc} alt="capsule" />
                    </div>
                    <div className="tc-detail-createdAt">
                      작성일: {createdText}
                    </div>
                  </div>

                  <div className="tc-detail-right">
                    <input
                      className="tc-detail-input"
                      value={capsule?.title || ""}
                      readOnly
                      placeholder="제목"
                    />

                    <textarea
                      className="tc-detail-textarea"
                      value={capsule?.content || ""}
                      readOnly
                      placeholder="내용"
                    />
                  </div>
                </div>

              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
