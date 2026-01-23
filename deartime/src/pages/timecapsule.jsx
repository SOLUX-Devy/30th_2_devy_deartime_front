// src/pages/timecapsule.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/background_nostar.png";
import "../styles/timecapsule.css";
import TimeCapsuleCard from "../components/TimeCapsuleCard";
import { fetchMe } from "../api/user"; // ✅ 추가

function isOpenableByTime(openAtIso) {
  if (!openAtIso) return false;
  const now = Date.now();
  const openAtMs = new Date(openAtIso).getTime();
  if (Number.isNaN(openAtMs)) return false;
  return now >= openAtMs;
}

function toBool(v) {
  return v === true || v === "true" || v === 1 || v === "1";
}

const TimeCapsule = () => {
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const tabs = ["전체 캡슐", "받은 캡슐", "나의 캡슐"];
  const [activeIndex, setActiveIndex] = useState(0);
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  // ✅ myUserId를 localStorage가 아니라 /users/me로 가져와 상태로 유지
  const [myUserId, setMyUserId] = useState(null);

  const [page, setPage] = useState(1);
  const pageSize = 8;

  const sortOrder = "desc";
  const [rawCapsules, setRawCapsules] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ 1) 진입 시 내 정보 먼저 확보 (토큰 기반)
  useEffect(() => {
    const loadMe = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setMyUserId(null);
          return;
        }

        const me = await fetchMe();
        const uid = Number(me?.userId);

        if (!uid) throw new Error("me.userId 없음");

        setMyUserId(uid);

        // ✅ 선택: 다른 페이지에서도 쓰려면 저장해두기 (권장)
        localStorage.setItem("userId", String(uid));
      } catch (e) {
        console.error("[TC] fetchMe failed:", e);
        setMyUserId(null);
      }
    };

    loadMe();
  }, []);

  const apiType = useMemo(() => {
    if (activeIndex === 0) return "ALL";
    if (activeIndex === 1) return "RECEIVED";
    return "SENT";
  }, [activeIndex]);

  // ✅ 2) myUserId 준비된 뒤에 캡슐 목록 호출
  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setRawCapsules([]);
          return;
        }

        // ✅ myUserId 없으면 필터가 깨지니까 호출/렌더 보류
        if (!myUserId) return;

        setLoading(true);

        const params = new URLSearchParams();
        params.set("type", apiType);
        params.set("page", "0");
        params.set("size", "2000");
        params.set("sort", `createdAt,${sortOrder}`);

        const res = await fetch(
          `${apiBaseUrl}/api/timecapsules?${params.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const json = await res.json();

        if (!res.ok || json?.success === false) {
          throw new Error(json?.message || "타임캡슐 목록 조회 실패");
        }

        const payload = json?.data;
        const list = payload?.data ?? [];

        const normalized = list.map((c) => ({
          ...c,
          senderId: Number(c.senderId),
          receiverId: Number(c.receiverId),
          opened: toBool(c?.opened),
          canAccess: c.canAccess,
        }));

        setRawCapsules(normalized);
      } catch (e) {
        console.error("[TC] fetchCapsules failed:", e);
        setRawCapsules([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCapsules();
  }, [apiType, sortOrder, apiBaseUrl, myUserId]); // ✅ myUserId 의존 추가

  // ✅ 3) 필터도 myUserId 없으면 안전하게 빈 배열
  const filteredCapsules = useMemo(() => {
    if (!myUserId) return [];

    const myId = myUserId;
    const onlyToMe = rawCapsules.filter((c) => c.receiverId === myId);

    let base = onlyToMe;

    if (activeIndex === 1) {
      base = onlyToMe.filter((c) => c.senderId !== myId);
    } else if (activeIndex === 2) {
      base = onlyToMe.filter((c) => c.senderId === myId);
    }

    if (showOpenOnly) {
      return base.filter((c) => isOpenableByTime(c.openAt));
    }

    return base;
  }, [rawCapsules, activeIndex, myUserId, showOpenOnly]);

  const totalElements = filteredCapsules.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  const capsules = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCapsules.slice(start, start + pageSize);
  }, [filteredCapsules, page, pageSize]);

  const emptyCount = Math.max(0, pageSize - capsules.length);

  const rangeText = useMemo(() => {
    if (totalElements === 0) return `0개 중 0-0`;
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, totalElements);
    return `${totalElements}개 중 ${start}-${end}`;
  }, [totalElements, page, pageSize]);

  return (
    <div className="timecapsule-container" style={{ backgroundImage: `url(${bg})` }}>
      {/* 상단 영역 */}
      <div className="tc-topbar">
        <div style={{ display: "flex", gap: "50px", marginBottom: "0px", marginLeft: "60px", marginTop: "10px" }}>
          {tabs.map((tab, index) => {
            const isActive = index === activeIndex;
            return (
              <span
                key={tab}
                onClick={() => {
                  setActiveIndex(index);
                  setShowOpenOnly(false);
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
          <button type="button" className="tc-create-btn" onClick={() => navigate("/timecapsule/create")}>
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

      {/* ✅ myUserId 로딩 중이면 안내 */}
      {!myUserId ? (
        <div className="tc-empty" style={{ padding: "40px 0" }}>
          사용자 정보를 불러오는 중...
        </div>
      ) : (
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
                    onClick={(clickedCapsule) => {
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
      )}
    </div>
  );
};

export default TimeCapsule;
