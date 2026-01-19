// src/pages/letterboxPage.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import "../styles/LetterboxPage.css";

import LetterCard from "../components/LetterCard";
import MailTabs from "../components/MailTabs";
import SendButton from "../components/SendButton";
import SharedMailbox from "../components/SharedMailbox";
import FriendSelect from "../components/FriendSelect";
import DeleteCheck from "../components/DeleteCheck";

import { Trash2 } from "lucide-react";

export default function Letterbox() {
  const [activeIndex, setActiveIndex] = useState(0);
  // UI는 1페이지부터 시작하지만, API는 0페이지부터 시작하므로 관리 주의
  const [page, setPage] = useState(1);

  const [letters, setLetters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 서버에서 받아올 페이징 정보 저장용 상태
  const [serverPageInfo, setServerPageInfo] = useState({
    totalElements: 0,
    totalPages: 1,
  });

  // ✅ 선택(spotlight) 카드 id
  const [focusedId, setFocusedId] = useState(null);

  // ✅ 컨텍스트 메뉴(FriendList 동일)
  const [menu, setMenu] = useState({
    show: false,
    x: 0,
    y: 0,
    targetId: null,
  });

  // ✅ 삭제 확인 모달
  const [isDeleteCheckOpen, setIsDeleteCheckOpen] = useState(false);

  // ✅ 롱프레스
  const longPressTimerRef = useRef(null);
  const pressTargetElRef = useRef(null);
  const justLongPressedRef = useRef(false);

  // 우리의 우체통(친구 선택)
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const pageSize = 8;

  // 엔드포인트 결정 함수 (실제 API 주소로 변경)
  const getApiUrl = (index, pageNum) => {
    const basePage = pageNum - 1; // UI(1~ ) -> API(0~ )
    const commonParams = `sort=createdAt,desc&page=${basePage}&size=${pageSize}`;
    
    switch (index) {
      case 0: // 받은 편지함 (주소가 /api/letters/received 라고 가정)
        return `/api/letters/received?${commonParams}`;
      case 1: // 보낸 편지함 (명세서 주소)
        return `/api/letters/sent?${commonParams}`;
      case 2: // 즐겨찾기 (주소가 /api/letters/bookmarks 라고 가정)
        return `/api/letters/bookmarks?${commonParams}`;
      default:
        return null;
    }
  };

  // 2. API 호출 useEffect
  useEffect(() => {
    if (activeIndex === 3) return; // '우리의 우체통' 탭은 별도 로직

    const url = getApiUrl(activeIndex, page);
    if (!url) return;

    //setIsLoading(true);

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 로그인 연동 시 저장한 accessToken 사용
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("네트워크 응답 에러");
        return res.json();
      })
      .then((json) => {
        if (json.success) {
          // 명세서 구조: json.data.data 가 배열
          setLetters(json.data.data || []);
          // 페이지네이션 정보 업데이트
          setServerPageInfo({
            totalElements: json.data.totalElements,
            totalPages: json.data.totalPages,
          });
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("데이터 로드 실패:", err);
        setLetters([]);
        setIsLoading(false);
      });
  }, [activeIndex, page]); // 탭이 바뀌거나 페이지가 바뀔 때마다 다시 호출

  /// 페이지네이션 계산 (서버 데이터를 기준으로 변경)
  const { totalElements, totalPages } = serverPageInfo;

  // 현재 페이지가 전체 페이지보다 크면 마지막 페이지를 보여주도록 제한
  const safePage = Math.min(page, totalPages);
  
  // 현재 페이지에서 보여주는 아이템 범위 계산
  const startItem = totalElements === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalElements);

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  // 이제 currentItems는 letters 전체가 됩니다 (서버가 이미 잘라서 주기 때문)
  const currentItems = letters; 
  const emptySlotsCount = pageSize - currentItems.length;

  // 삭제
  const deleteLetter = (id) => {
    setLetters((prev) => prev.filter((letter) => letter.letterId !== id));
  };

  // 즐겨찾기 토글
  const handleToggleBookmark = (id) => {
    setLetters((prev) =>
      prev.map((letter) =>
        letter.letterId === id
          ? { ...letter, isBookmarked: !letter.isBookmarked }
          : letter
      )
    );
  };

  // 읽음 처리
  const handleMarkAsRead = (id) => {
    setLetters((prev) =>
      prev.map((letter) =>
        letter.letterId === id ? { ...letter, isRead: true } : letter
      )
    );
  };

  // =========================
  // FriendList 방식: 메뉴 열기/닫기
  // =========================
  const closeMenu = () => {
    setMenu((prev) => ({ ...prev, show: false, targetId: null }));
    setFocusedId(null);
  };

  // 메뉴가 열려있으면 ESC/스크롤/리사이즈로 닫기 (FriendList 동일)
  useEffect(() => {
    if (!menu.show) return;

    const onKey = (e) => e.key === "Escape" && closeMenu();
    const onScroll = () => closeMenu();
    const onResize = () => closeMenu();

    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [menu.show]);

  // 카드 중앙 좌표로 메뉴 띄우기
  const openMenuAtCardCenter = (el, id) => {
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    setFocusedId(id);
    setMenu({ show: true, x: centerX, y: centerY, targetId: id });
  };

  // 우클릭
  const handleContextMenu = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    openMenuAtCardCenter(e.currentTarget, id);
  };

  // 롱프레스 시작
  const startPress = (e, id) => {
    if (e.type === "mousedown" && e.button !== 0) return;

    pressTargetElRef.current = e.currentTarget;
    justLongPressedRef.current = false;

    longPressTimerRef.current = setTimeout(() => {
      const el = pressTargetElRef.current;
      if (!el) return;
      openMenuAtCardCenter(el, id);
      justLongPressedRef.current = true;
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const cancelPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    pressTargetElRef.current = null;
  };

  // 롱프레스 직후 “클릭” 무시 (상세보기 열리는 거 방지)
  const stopClickAfterLongPress = (e, id) => {
    if (justLongPressedRef.current && focusedId === id) {
      e.stopPropagation();
      justLongPressedRef.current = false;
    }
  };

  // 메뉴에서 "삭제" 눌렀을 때 → 확인 모달
  const onClickDeleteMenu = (e) => {
    e.stopPropagation();
    setIsDeleteCheckOpen(true);
  };

  // 확인 모달: 삭제 확정
  const handleConfirmDelete = () => {
    if (!menu.targetId) return;
    deleteLetter(menu.targetId);
    setIsDeleteCheckOpen(false);
    closeMenu();
  };

  // 확인 모달: 취소
  const handleCancelDelete = () => {
    setIsDeleteCheckOpen(false);
    closeMenu();
  };

  // 페이지 바깥 클릭: 메뉴 닫기
  const handlePageClick = () => {
    if (menu.show) closeMenu();
    else if (focusedId) setFocusedId(null);
  };

  return (
    <div
      className={`letterbox-container ${focusedId ? "is-focusing" : ""}`}
      onClick={handlePageClick}
    >
      <header className="letterbox-header" onClick={(e) => e.stopPropagation()}>
        <MailTabs
          activeIndex={activeIndex}
          setActiveIndex={(index) => {
            setPage(1);
            setIsLoading(index !== 3);
            setActiveIndex(index);

            // 탭 전환 시 팝업 초기화
            if (index !== 3) {
              setIsSelectorOpen(false);
              setSelectedFriend(null);
            }

            closeMenu();
          }}
        />
        <SendButton />
      </header>

      <div className="letterbox-content">
        {activeIndex === 3 ? (
          <>
            {!selectedFriend ? (
              <div className="shared-mailbox-container">
                <header className="shared-header">
                  <button
                    className="friend-select-trigger user-tag"
                    onClick={() => setIsSelectorOpen(true)}
                  >
                    친구 선택
                    <span className="arrow">→</span>
                  </button>
                </header>

                <div className="shared-mailbox-empty">
                  <div className="empty-content">
                    <div className="mail-icon">
                      <svg
                        width="60"
                        height="60"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </div>
                    <p>친구를 선택하면 우리의 추억이 펼쳐집니다.</p>
                  </div>
                </div>

                {isSelectorOpen && (
                  <FriendSelect
                    onClose={() => setIsSelectorOpen(false)}
                    onSelect={(friend) => {
                      setSelectedFriend(friend);
                      setIsSelectorOpen(false);
                    }}
                  />
                )}
              </div>
            ) : (
              <SharedMailbox
                selectedFriend={selectedFriend}
                onBack={() => setSelectedFriend(null)}
              />
            )}

            {isSelectorOpen && (
              <FriendSelect
                onClose={() => setIsSelectorOpen(false)}
                onSelect={(friend) => {
                  setSelectedFriend(friend);
                  setIsSelectorOpen(false);
                }}
              />
            )}
          </>
        ) : (
          <>
            <span className="tc-pagination-info">
              {totalElements}개 중 {startItem}-{endItem}
            </span>

            {/* ✅ FriendList 동일: 메뉴 열리면 overlay */}
            {menu.show && (
              <div
                className="context-menu-overlay"
                onClick={(e) => {
                  e.stopPropagation();
                  closeMenu();
                }}
              />
            )}

            {/* ✅ FriendList 동일: 메뉴(삭제 1개) */}
            {menu.show && (
              <div
                className="custom-context-menu"
                style={{ top: menu.y, left: menu.x }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="menu-item delete" onClick={onClickDeleteMenu}>
                  <Trash2 size={20} color="#FF4D4D" />
                  <span>삭제</span>
                </div>
              </div>
            )}

            <main className="letter-grid">
              {isLoading ? (
                <p>로딩 중...</p>
                ) : letters.length === 0 ? ( 
                  /* 편지가 없을 때 보여줄 빈 상태(Empty State) 화면 */
                  /* 데이터 로딩이 끝났는데(isLoading: false) 편지가 0개인 경우 실행 */
                  <div className="no-letters-container">
                    <div className="no-letters-content">
                      <p>아직 편지가 없어요.</p>
                      <span>친구들에게 먼저 소식을 전해보는 건 어떨까요?</span>
                    </div>
                  </div>
                ) : (
                  <>
                  {currentItems.map((letter) => {
                    const isSpotlight = menu.show && menu.targetId === letter.letterId;

                    return (
                      <div
                        key={letter.letterId}
                        className={`letter-item ${isSpotlight ? "spotlight" : ""}`}
                        onContextMenu={(e) => handleContextMenu(e, letter.letterId)}
                        onMouseDown={(e) => startPress(e, letter.letterId)}
                        onMouseUp={cancelPress}
                        onMouseLeave={cancelPress}
                        onTouchStart={(e) => startPress(e, letter.letterId)}
                        onTouchEnd={cancelPress}
                        onClickCapture={(e) => stopClickAfterLongPress(e, letter.letterId)}
                      >
                        <LetterCard
                          data={letter}
                          isFocused={focusedId === letter.letterId}
                          onToggleBookmark={() => handleToggleBookmark(letter.letterId)}
                          onMarkAsRead={() => handleMarkAsRead(letter.letterId)}
                        />
                      </div>
                    );
                  })}

                  {Array.from({ length: emptySlotsCount }).map((_, i) => (
                    <div key={`empty-${i}`} className="letter-card-placeholder" />
                  ))}
                </>
              )}
            </main>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="tc-pagination">
                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPage(p);
                      closeMenu();
                    }}
                    className={`tc-page ${p === safePage ? "active" : ""}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}

            {/* ✅ 삭제 확인 모달 (FriendList 메뉴에서만 열림) */}
            <DeleteCheck
              isOpen={isDeleteCheckOpen}
              onClose={handleCancelDelete}
              onConfirm={handleConfirmDelete}
            />
          </>
        )}
      </div>
    </div>
  );
}
