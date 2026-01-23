// src/pages/timecapsule.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/background_nostar.png";
import "../styles/timecapsule.css";
import TimeCapsuleCard from "../components/TimeCapsuleCard";

const TimeCapsule = () => {
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const tabs = ["전체 캡슐", "받은 캡슐", "나의 캡슐"];
  const [activeIndex, setActiveIndex] = useState(0);
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  const myUserId = Number(localStorage.getItem("userId")) || 2;

  // ✅ UI는 1부터 (프론트에서 slice 페이지네이션)
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // ✅ 정렬
  const sortOrder = "desc";

  // ✅ API 원본 데이터(전체를 넉넉히 받아온 뒤, 프론트에서 규칙 필터+페이지네이션)
  const [rawCapsules, setRawCapsules] = useState([]);
  const [loading, setLoading] = useState(false);

  // -------------------------
  // 탭 → API type 매핑
  // -------------------------
  const apiType = useMemo(() => {
    if (activeIndex === 0) return "ALL";
    if (activeIndex === 1) return "RECEIVED";
    return "SENT";
  }, [activeIndex]);

  // -------------------------
  // API 호출 (✅ 서버 페이지네이션 사용 X: 크게 받아오기)
  // -------------------------
  useEffect(() => {
    const fetchCapsules = async () => {
      console.log("[TC] token=", localStorage.getItem("accessToken"));
      console.log("[TC] userId=", localStorage.getItem("userId"));
      try {
        setLoading(true);

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setRawCapsules([]);
          return;
        }

        const params = new URLSearchParams();
        params.set("type", apiType);
        params.set("page", "0");
        params.set("size", "2000"); // ✅ 충분히 큰 값(필요하면 조절)
        params.set("sort", `createdAt,${sortOrder}`);

        const res = await fetch(
          `${apiBaseUrl}/api/timecapsules?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        );

        const json = await res.json();

        if (!res.ok || json?.success === false) {
          throw new Error(json?.message || "타임캡슐 목록 조회 실패");
        }

        const payload = json?.data;
        const list = payload?.data ?? [];

        // ✅ 숫자 타입 통일
        const normalized = list.map((c) => ({
          ...c,
          senderId: Number(c.senderId),
          receiverId: Number(c.receiverId),
          
          canAccess: c.canAccess,
          opened: c.opened,
        }));

        setRawCapsules(normalized);
      } catch (e) {
        console.error(e);
        setRawCapsules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCapsules();
  }, [apiType, sortOrder, apiBaseUrl]);

  // -------------------------
  // ✅ 최종 필터(너가 확정한 규칙)
  // - 전체: receiverId === 나 (나->나 + 남->나)
  // - 받은: receiverId === 나 && senderId !== 나
  // - 나의: receiverId === 나 && senderId === 나
  // - 나->남( senderId===나 && receiverId!==나 )는 전부 제외 (receiverId 1차 필터로 제거)
  // - 토글 ON: canAccess === true만
  // -------------------------
  const filteredCapsules = useMemo(() => {
    const myId = myUserId;

    // 1) "나에게 온 것만" (나->남 완전 제거)
    const onlyToMe = rawCapsules.filter((c) => c.receiverId === myId);

    // 2) 탭별
    let base = onlyToMe;
    if (activeIndex === 1) {
      // 받은: 남->나
      base = onlyToMe.filter((c) => c.senderId !== myId);
    } else if (activeIndex === 2) {
      // 나의: 나->나
      base = onlyToMe.filter((c) => c.senderId === myId);
    }

    // 3) 토글별
    if (showOpenOnly) {
      return base.filter((c) => c.canAccess === true);
    }
    return base;
  }, [rawCapsules, activeIndex, myUserId, showOpenOnly]);

  // -------------------------
  // ✅ 프론트 페이지네이션(slice)
  // -------------------------
  const totalElements = filteredCapsules.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages],
  );

  const capsules = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCapsules.slice(start, start + pageSize);
  }, [filteredCapsules, page, pageSize]);

  const emptyCount = Math.max(0, pageSize - capsules.length);

  // ✅ "몇개 중 몇개" (필터링된 totalElements 기준)
  const rangeText = useMemo(() => {
    if (totalElements === 0) return `0개 중 0-0`;

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalElements);
    return `${totalElements}개 중 ${start}-${end}`;
  }, [totalElements, page, pageSize]);

  return (
    <div
      className="timecapsule-container"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* 상단 영역 */}
      <div className="tc-topbar">
        <div
          style={{
            display: "flex",
            gap: "50px",
            marginBottom: "0px",
            marginLeft: "60px",
            marginTop: "10px",
          }}
        >
          {tabs.map((tab, index) => {
            const isActive = index === activeIndex;

            return (
              <span
                key={tab}
                onClick={() => {
                  setActiveIndex(index);
                  setShowOpenOnly(false); // 탭 바꾸면 토글 끄기
                  setPage(1);
                }}
                style={{
                  position: "relative",
                  fontSize: "20px",
                  fontWeight: isActive ? 600 : 350,
                  paddingBottom: "6px",
                  cursor: "pointer",
                  color: "white",
                  opacity: isActive ? 1 : 0.7,
                  transition: "opacity 0.2s ease",
                }}
              >
                {tab}
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    width: "100%",
                    height: "2px",
                    backgroundColor: "#0E77BC",
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "center",
                    transition: "transform 0.3s ease",
                  }}
                />
              </span>
            );
          })}
        </div>

        <div className="tc-topbar-right">
          <button
            type="button"
            className="tc-create-btn"
            onClick={() => navigate("/timecapsule/create")}
          >
            캡슐 생성
          </button>
        </div>
      </div>

      {/* 토글 줄 */}
      <div className="tc-toggle-row">
        <div className="open-only-toggle">
          <span className="toggle-label">열린 캡슐만 보기</span>

          <button
            type="button"
            className={`toggle-button ${showOpenOnly ? "on" : ""}`}
            onClick={() => {
              setShowOpenOnly((prev) => !prev);
              setPage(1);
            }}
            aria-pressed={showOpenOnly}
          >
            <span className="toggle-knob" />
          </button>
        </div>

        <div className="tc-range">{rangeText}</div>
      </div>

      {/* 카드 목록 + 페이지네이션 */}
      <div className="tc-layout">
        <div className="tc-grid">
          {loading ? (
            <>
              <div className="tc-empty">불러오는 중...</div>
              {Array.from({ length: pageSize }).map((_, idx) => (
                <div key={`empty-${idx}`} className="tc-card--empty" />
              ))}
            </>
          ) : capsules.length === 0 ? (
            <>
              <div className="tc-empty">캡슐이 없습니다.</div>
              {Array.from({ length: pageSize }).map((_, idx) => (
                <div key={`empty-${idx}`} className="tc-card--empty" />
              ))}
            </>
          ) : (
            <>
              {capsules.map((capsule) => (
                <TimeCapsuleCard
                  key={capsule.id}
                  capsule={capsule}
                  onClick={(clickedCapsule, meta) => {
                    // ✅ TimeCapsuleCard에서 canAccess=false는 이미 클릭 자체가 막힘
                    // meta?.markOpened === true : sparkle(열 수 있음 + 아직 안열림) 클릭
                    // meta?.markOpened === false: 이미 열린 캡슐 클릭
                    navigate(`/timecapsule/${clickedCapsule.id}`);
                  }}
                />
              ))}

              {Array.from({ length: emptyCount }).map((_, idx) => (
                <div key={`empty-${idx}`} className="tc-card--empty" />
              ))}
            </>
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className="tc-pagination">
            {pageNumbers.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`tc-page ${p === page ? "active" : ""}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeCapsule;
