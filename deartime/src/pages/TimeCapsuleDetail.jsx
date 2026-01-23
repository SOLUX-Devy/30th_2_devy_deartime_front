// src/pages/TimeCapsuleDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import bg from "../assets/background_star.png";
import "../styles/timecapsuleDetail.css";
import noPhoto from "../assets/nophoto.png";

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

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const [loading, setLoading] = useState(true);
  const [capsule, setCapsule] = useState(null);

  // ✅ 에러 메시지(원하면 UI에 보여줄 수 있음)
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        const token = localStorage.getItem("accessToken");
        if (!token) {
          // 로그인 필요
          navigate("/login");
          return;
        }

        const idNum = Number(capsuleId);
        if (!Number.isFinite(idNum)) {
          navigate("/timecapsule");
          return;
        }

        const res = await fetch(`${apiBaseUrl}/api/timecapsules/${idNum}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // 403/404 포함해서 서버가 JSON 내려준다고 했으니까 우선 파싱
        const json = await res.json().catch(() => null);

        // ✅ 성공
        if (res.ok && json?.success) {
          setCapsule(json.data);
          return;
        }

        // ✅ 실패 분기 (스펙 기준)
        const msg = json?.message || "타임캡슐 상세 조회 실패";
        setErrorMessage(msg);

        if (res.status === 403) {
          // 1) 아직 열 수 없음  2) 접근 권한 없음
          // UX 선택지:
          // - 목록으로 보내기 (지금 너의 기존 정책)
          // - 혹은 에러 문구 보여주고 뒤로가기 버튼
          navigate("/timecapsule");
          return;
        }

        if (res.status === 404) {
          navigate("/timecapsule");
          return;
        }

        // 그 외(500 등)
        navigate("/timecapsule");
      } catch (e) {
        console.error(e);
        setErrorMessage("네트워크 오류가 발생했어요.");
        navigate("/timecapsule");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [apiBaseUrl, capsuleId, navigate]);

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
            ) : capsule ? (
              <>
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

                <div className="tc-detail-main">
                  <div className="tc-detail-left">
                    <div className="tc-detail-imageBox">
                      <img
                        className="tc-detail-image"
                        src={imgSrc}
                        alt="capsule"
                      />
                    </div>
                    <div className="tc-detail-createdAt">작성일: {createdText}</div>
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
            ) : (
              // 만약 navigate 안 하고 현재 페이지에서 메시지 보여주고 싶으면 이 블럭 사용
              <div className="tc-detail-loading">
                {errorMessage || "캡슐을 불러올 수 없어요."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
