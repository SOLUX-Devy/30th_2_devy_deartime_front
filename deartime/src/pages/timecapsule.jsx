// src/pages/timecapsule.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/background_nostar.png";
import "../styles/timecapsule.css";
import TimeCapsuleCard from "../components/TimeCapsuleCard";
import LockedCapsuleModal from "../components/LockedCapsuleModal";

const TimeCapsule = () => {
  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

  const tabs = ["전체 캡슐", "받은 캡슐", "나의 캡슐"];
  const [activeIndex, setActiveIndex] = useState(0);
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const myUserId = Number(localStorage.getItem("userId")) || 2;

  // ✅ UI는 1부터
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // ✅ 정렬
  const sortOrder = "desc"; // 필요하면 state로

  // ✅ API 데이터(원본)
  const [rawCapsules, setRawCapsules] = useState([]);
  const [pageInfo, setPageInfo] = useState({
    currentPage: 0,
    totalPages: 1,
    totalElements: 0,
    pageSize: pageSize,
    isFirst: true,
    isLast: true,
  });
  const [loading, setLoading] = useState(false);

  // ✅ 잠김 모달
  const [lockedModalOpen, setLockedModalOpen] = useState(false);
  const [lockedMessage, setLockedMessage] =
    useState("아직 열 수 없는 타임캡슐이에요");

  // -------------------------
  // 탭 + 토글 → API type 매핑
  // -------------------------
  const apiType = useMemo(() => {
    if (activeIndex === 0) return "ALL";
    if (activeIndex === 1) return "RECEIVED";
    return "SENT";
  }, [activeIndex]);

  // -------------------------
  // API 호출
  // -------------------------
  useEffect(() => {
    const fetchCapsules = async () => {
      try {
        setLoading(true);

        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          setRawCapsules([]);
          setPageInfo((prev) => ({
            ...prev,
            totalElements: 0,
            totalPages: 1,
            currentPage: 0,
          }));
          return;
        }

        // UI(1부터) → API(0부터)
        const apiPage = Math.max(0, page - 1);

        const params = new URLSearchParams();
        params.set("type", apiType);
        params.set("page", String(apiPage));
        params.set("size", String(pageSize));
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

        // ✅ id 타입(문자/숫자) 섞여도 안전하게 숫자로 맞춤
        const normalized = list.map((c) => ({
          ...c,
          senderId: Number(c.senderId),
          receiverId: Number(c.receiverId),
        }));

        setRawCapsules(normalized);

        setPageInfo({
          currentPage: payload?.currentPage ?? apiPage,
          totalPages: payload?.totalPages ?? 1,
          totalElements: payload?.totalElements ?? list.length,
          pageSize: payload?.pageSize ?? pageSize,
          isFirst: payload?.isFirst ?? true,
          isLast: payload?.isLast ?? true,
        });
      } catch (e) {
        console.error(e);
        setRawCapsules([]);
        setPageInfo((prev) => ({
          ...prev,
          totalElements: 0,
          totalPages: 1,
          currentPage: 0,
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchCapsules();
  }, [apiType, page, pageSize, sortOrder, apiBaseUrl]);

  // -------------------------
  // ✅ 탭별 필터 규칙 (너가 원하는 룰)
  // 전체캡슐 : 나->나 && 남->나
  // 받은캡슐 : 남->나
  // 나의캡슐 : 나->나
  // -------------------------
  const tabFiltered = useMemo(() => {
    // 0) 공통: 나에게 온 것만 (나->남 제거)
    const onlyToMe = rawCapsules.filter((c) => c.receiverId === myUserId);

    // 1) 탭별
    let base = onlyToMe;
    if (activeIndex === 1)
      base = onlyToMe.filter((c) => c.senderId !== myUserId); // 받은: 남->나
    if (activeIndex === 2)
      base = onlyToMe.filter((c) => c.senderId === myUserId); // 나의: 나->나

    // 2) 토글별 (ON일 때만 열린 것만)
    if (showOpenOnly) return base.filter((c) => c.canAccess);

    // OFF면 잠긴 것도 포함해서 전부
    return base;
  }, [rawCapsules, activeIndex, myUserId, showOpenOnly]);

  // -------------------------
  // 페이지네이션/빈칸 계산 (UI용)
  // -------------------------
  const totalPages = Math.max(1, pageInfo.totalPages || 1);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages],
  );

  const emptyCount = Math.max(0, pageSize - tabFiltered.length);

  const rangeText = useMemo(() => {
    const total = pageInfo.totalElements ?? 0;
    if (total === 0) return `0개 중 0-0`;

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    return `${total}개 중 ${start}-${end}`;
  }, [pageInfo.totalElements, page, pageSize]);

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
          ) : tabFiltered.length === 0 ? (
            <>
              <div className="tc-empty">캡슐이 없습니다.</div>
              {Array.from({ length: pageSize }).map((_, idx) => (
                <div key={`empty-${idx}`} className="tc-card--empty" />
              ))}
            </>
          ) : (
            <>
              {tabFiltered.map((capsule) => (
                <TimeCapsuleCard
                  key={capsule.id}
                  capsule={capsule}
                  onClick={() => {
                    if (!capsule.canAccess) {
                      setLockedMessage("아직 열 수 없는 타임캡슐이에요");
                      setLockedModalOpen(true);
                      return;
                    }
                    navigate(`/timecapsule/${capsule.id}`);
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

      <LockedCapsuleModal
        open={lockedModalOpen}
        message={lockedMessage}
        onClose={() => setLockedModalOpen(false)}
      />
    </div>
  );
};

export default TimeCapsule;
