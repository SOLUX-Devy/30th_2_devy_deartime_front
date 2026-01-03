import React, { useMemo, useState } from 'react';
import bg from '../assets/background_nostar.png';
import '../styles/timecapsule.css';
import TimeCapsuleCard from '../components/TimeCapsuleCard';

const TimeCapsule = () => {
  const tabs = ['전체 캡슐', '받은 캡슐', '나의 캡슐'];
  const [activeIndex, setActiveIndex] = useState(0);
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  // ✅ 페이지네이션
  const [page, setPage] = useState(1); // UI 편하게 1부터
  const pageSize = 8;

  // ✅ 정렬: 'desc' = 최신순(추천), 'asc' = 오래된순
  const sortOrder = 'desc';

  // ✅ 임시 로그인 유저(나중에 auth에서 가져오면 됨)
  const myUserId = 2;

  // ✅ 목데이터: API 연동 전 테스트용
  const mockCapsules = useMemo(
    () => [
      // canAccess=false (투명 박스)
      {
        id: 1,
        title: '2년 뒤의 나에게',
        content: null,
        theme: 'graduation',
        imageUrl: null,
        openAt: '2027-01-20T15:30:00',
        isNotified: false,
        senderId: 1,
        senderNickname: 'user1',
        senderProfileImageUrl: null,
        receiverId: 2,
        receiverNickname: 'me',
        receiverProfileImageUrl: null,
        createdAt: '2025-09-30T10:00:00.000000',
        opened: false,
        canAccess: false,
      },

      // canAccess=true & opened=false (파란 박스)
      {
        id: 2,
        title: '내일의 나에게',
        content: null,
        theme: 'daily',
        imageUrl: null,
        openAt: '2026-01-01T15:30:00',
        isNotified: false,
        senderId: 2,
        senderNickname: 'me',
        receiverId: 2,
        receiverNickname: 'me',
        createdAt: '2025-10-01T12:00:00.000000',
        opened: false,
        canAccess: true,
      },

      // canAccess=true & opened=true (검정20% + 파랑테두리)
      {
        id: 3,
        title: '열린 캡슐 예시',
        content: '열렸으니까 내용이 보입니다!',
        theme: 'happy',
        imageUrl: null,
        openAt: '2025-09-01T09:00:00',
        isNotified: true,
        senderId: 2,
        senderNickname: 'me',
        receiverId: 2,
        receiverNickname: 'me',
        createdAt: '2025-08-20T14:00:00.000000',
        opened: true,
        canAccess: true,
      },

      // 받은 캡슐 예시
      {
        id: 4,
        title: '받은 캡슐',
        content: null,
        theme: 'letter',
        imageUrl: null,
        openAt: '2026-03-03T00:00:00',
        senderId: 9,
        senderNickname: 'user9',
        receiverId: 2,
        receiverNickname: 'me',
        createdAt: '2025-11-11T09:30:00.000000',
        opened: false,
        canAccess: false,
      },

      {
        id: 5,
        title: '받은 캡슐',
        content: null,
        theme: 'letter',
        imageUrl: null,
        openAt: '2026-01-02T00:00:00',
        senderId: 9,
        senderNickname: 'user9',
        receiverId: 2,
        receiverNickname: 'me',
        createdAt: '2025-11-11T09:30:00.000000',
        opened: false,
        canAccess: true,
      },

      {
        id: 6,
        title: '받은 캡슐',
        content: null,
        theme: 'letter',
        imageUrl: null,
        openAt: '2026-01-02T00:00:00',
        senderId: 9,
        senderNickname: 'user9',
        receiverId: 2,
        receiverNickname: 'me',
        createdAt: '2025-11-11T09:30:00.000000',
        opened: false,
        canAccess: true,
      },

      {
        id: 7,
        title: '받은 캡슐',
        content: null,
        theme: 'letter',
        imageUrl: null,
        openAt: '2026-01-02T00:00:00',
        senderId: 9,
        senderNickname: 'user9',
        receiverId: 2,
        receiverNickname: 'me',
        createdAt: '2025-11-11T09:30:00.000000',
        opened: false,
        canAccess: true,
      },

      {
        id: 8,
        title: '받은 캡슐',
        content: null,
        theme: 'letter',
        imageUrl: null,
        openAt: '2026-01-02T00:00:00',
        senderId: 9,
        senderNickname: 'user9',
        receiverId: 2,
        receiverNickname: 'me',
        createdAt: '2025-11-11T09:30:00.000000',
        opened: false,
        canAccess: true,
      },

      {
        id: 9,
        title: '받은 캡슐',
        content: null,
        theme: 'letter',
        imageUrl: null,
        openAt: '2026-01-02T00:00:00',
        senderId: 9,
        senderNickname: 'user9',
        receiverId: 2,
        receiverNickname: 'me',
        createdAt: '2025-11-11T09:30:00.000000',
        opened: false,
        canAccess: true,
      },

      {
        id: 10,
        title: '받은 캡슐',
        content: null,
        theme: 'letter',
        imageUrl: null,
        openAt: '2026-01-02T00:00:00',
        senderId: 9,
        senderNickname: 'user9',
        receiverId: 2,
        receiverNickname: 'me',
        createdAt: '2025-11-11T09:30:00.000000',
        opened: true,
        canAccess: true,
      },

      {
        id: 11,
        title: '받은 캡슐',
        content: null,
        theme: 'letter',
        imageUrl: null,
        openAt: '2026-01-02T00:00:00',
        senderId: 9,
        senderNickname: 'user9',
        receiverId: 2,
        receiverNickname: 'me',
        createdAt: '2025-11-11T09:30:00.000000',
        opened: false,
        canAccess: true,
      },
    ],
    []
  );

  // ✅ 탭 필터
  const filteredByTab = useMemo(() => {
    if (activeIndex === 0) return mockCapsules;

    if (activeIndex === 1) {
      return mockCapsules.filter(
        (c) => c.receiverId === myUserId && c.senderId !== myUserId
      );
    }

    // activeIndex === 2 (나의 캡슐: senderId === receiverId === me)
    return mockCapsules.filter(
      (c) => c.senderId === c.receiverId && c.senderId === myUserId
    );
  }, [activeIndex, mockCapsules, myUserId]);

  // ✅ 열린 캡슐만 보기 (opened가 아니라 canAccess 기준)
  const finalList = useMemo(() => {
    if (!showOpenOnly) return filteredByTab;
    return filteredByTab.filter((c) => c.canAccess === true);
  }, [filteredByTab, showOpenOnly]);

  // ✅ createdAt 정렬
  const sortedList = useMemo(() => {
    const arr = [...finalList];
    arr.sort((a, b) => {
      const ta = new Date(a.createdAt).getTime();
      const tb = new Date(b.createdAt).getTime();
      return sortOrder === 'desc' ? tb - ta : ta - tb;
    });
    return arr;
  }, [finalList]);

  // ✅ 페이지 계산
  const totalElements = sortedList.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const safePage = Math.min(page, totalPages);

  const pagedList = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return sortedList.slice(start, start + pageSize);
  }, [sortedList, safePage]);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  return (
    <div
      className="timecapsule-container"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* 상단 세부 네비 */}
      <div
        style={{
          display: 'flex',
          gap: '50px',
          marginBottom: '0px',
          marginLeft: '60px',
          marginTop: '10px',
        }}
      >
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;

          return (
            <span
              key={tab}
              onClick={() => {
                setActiveIndex(index);
                setPage(1); // ✅ 탭 바뀌면 1페이지로
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.opacity = 1;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.opacity = 0.7;
              }}
              style={{
                position: 'relative',
                fontSize: '20px',
                fontWeight: isActive ? 600 : 350,
                paddingBottom: '6px',
                cursor: 'pointer',
                color: 'white',
                opacity: isActive ? 1 : 0.7,
                transition: 'opacity 0.2s ease',
              }}
            >
              {tab}

              {/* 클릭 시에만 촤악 나오는 밑줄 */}
              <span
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  width: '100%',
                  height: '2px',
                  backgroundColor: '#0E77BC',
                  transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'center',
                  transition: 'transform 0.3s ease',
                }}
              />
            </span>
          );
        })}
      </div>

      {/* 열린 캡슐만 보기 */}
      <div className="open-only-toggle">
        <span className="toggle-label">열린 캡슐만 보기</span>

        <button
          type="button"
          className={`toggle-button ${showOpenOnly ? 'on' : ''}`}
          onClick={() => {
            setShowOpenOnly((prev) => !prev);
            setPage(1); // ✅ 토글 바뀌면 1페이지로
          }}
          aria-pressed={showOpenOnly}
        >
          <span className="toggle-knob" />
        </button>
      </div>

      {/* ✅ A 방식: 컨텐츠가 적어도 페이지네이션이 아래로 내려가게 */}
      <div className="tc-layout">
        {/* ✅ 카드 목록 (페이지당 10개만) */}
        <div className="tc-grid">
          {pagedList.length === 0 ? (
            <div className="tc-empty">캡슐이 없습니다.</div>
          ) : (
            pagedList.map((capsule) => (
              <TimeCapsuleCard
                key={capsule.id}
                capsule={capsule}
                onClick={() => {
                  console.log('clicked capsule:', capsule.id);
                }}
              />
            ))
          )}
        </div>

        {/* ✅ 페이지네이션 (inline style 유지 + className 추가) */}
        {totalPages > 1 && (
          <div
            className="tc-pagination"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '26px',
            }}
          >
            {pageNumbers.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  border: 'none',
                  background: p === safePage ? '#0E77BC' : 'transparent',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: p === safePage ? 700 : 400,
                  cursor: 'pointer',
                  opacity: p === safePage ? 1 : 0.9,
                }}
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
