// src/pages/letterboxPage.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import "../styles/LetterboxPage.css";

import LetterDetail from "../components/LetterDetail";
import LetterCard from "../components/LetterCard";
import MailTabs from "../components/MailTabs";
import SendButton from "../components/SendButton";
import SharedMailbox from "../components/SharedMailbox";
import FriendSelect from "../components/FriendSelect";
import DeleteCheck from "../components/DeleteCheck";

import { Trash2 } from "lucide-react";

// 배경 이미지 임포트
import bgDarkBlue from "../assets/bg-dark-blue.png";
import bgLightPink from "../assets/bg-light-pink.png";
import bgLightGrey from "../assets/bg-light-grey.png";
import bgLightBlue from "../assets/bg-light-blue.png";

// 테마 코드에 따른 배경 이미지 매핑
const THEME_IMAGES = {
    theme1: bgDarkBlue,
    theme2: bgLightBlue,
    theme3: bgLightGrey,
    theme4: bgLightPink,
  };

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
        return `/api/letters/bookmarked?${commonParams}`;
      default:
        return null;
    }
  };

  // 2. API 호출 useEffect
  useEffect(() => {
    if (activeIndex === 3) return; // '우리의 우체통' 탭은 별도 로직

    const url = getApiUrl(activeIndex, page);
    if (!url) return;

    setIsLoading(true);

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // 로그인 연동 시 저장한 accessToken 사용
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("데이터를 불러오지 못했습니다.");
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
      })
      .finally(() => {
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

  // 이제 currentItems는 letters 전체가 됨 (서버가 이미 잘라서 주기 때문)
  const currentItems = letters; 
  const emptySlotsCount = pageSize - currentItems.length;

  // 즐겨찾기 토글
  const handleToggleBookmark = async (id) => {
  try {
    const targetLetter = letters.find(l => l.letterId === id);
    if (!targetLetter) return;

    // 서버에 상태 변경 요청
    const response = await fetch(`/api/letters/${id}/bookmark`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({ isBookmarked: !targetLetter.isBookmarked }),
    });

    const json = await response.json();

    if (json.success) {
      // 서버 성공 시에만 로컬 상태 업데이트
      setLetters((prev) => {
        if (activeIndex === 2) {
          return prev.filter((letter) => letter.letterId !== id);
        }
        return prev.map((letter) =>
          letter.letterId === id ? { ...letter, isBookmarked: !letter.isBookmarked } : letter
        );
      });
    }
  } catch (err) {
    console.error("즐겨찾기 요청 에러:", err);
  }
};


// 삭제 처리 (DELETE 연동)
const handleConfirmDelete = async () => {
  if (!menu.targetId) return;

  try {
    const response = await fetch(`/api/letters/${menu.targetId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    if (response.ok) {
      // 서버 삭제 성공 시 UI 업데이트
      setLetters((prev) => prev.filter((letter) => letter.letterId !== menu.targetId));
      setIsDeleteCheckOpen(false);
      closeMenu();
    } else {
      throw new Error("삭제에 실패했습니다.");
    }
  } catch (err) {
    console.error("삭제 요청 에러:", err);
  }
};

  // 읽음 처리
  const handleMarkAsRead = (id) => {
    setLetters((prev) =>
      prev.map((letter) =>
        letter.letterId === id ? { ...letter, isRead: true } : letter
      )
    );
  };

  // 선택된 편지(포커스된 편지) ID
  const [selectedLetter, setSelectedLetter] = useState(null);

  // 클릭 핸들러
  const handleLetterClick = (letter) => {
    // 상세 모달을 열기 위해 선택된 편지 정보를 저장합니다.
    setSelectedLetter(letter); 
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
    // 방금 막 롱프레스가 끝나서 메뉴가 처음 딱 떴을 때
    if (justLongPressedRef.current) {
      e.stopPropagation();           // 편지 상세보기가 열리는 걸 막음
      justLongPressedRef.current = false; // "방금 롱프레스함" 플래그를 바로 꺼줌
      return;                        // 여기서 끝내야 함! (closeMenu를 실행하지 않음)
    }

    // 메뉴가 이미 떠 있는 상태에서 카드를 한 번 더 클릭했을 때
    if (menu.show && menu.targetId === id) {
      e.stopPropagation();           // 편지 상세보기가 열리는 걸 막음
      closeMenu();                   // 이때만 메뉴를 닫음
    }
  };

  // 메뉴에서 "삭제" 눌렀을 때 → 확인 모달
  const onClickDeleteMenu = (e) => {
    e.stopPropagation();
    setIsDeleteCheckOpen(true);
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
                        onClick={(e) => {
                        if (menu.show) {
                          e.stopPropagation();
                          closeMenu(); // 메뉴가 열린 상태에서 카드를 누르면 메뉴만 닫히게 함
                        } else {
                          handleLetterClick(letter);
                        }
                      }}
                      // 메뉴가 열린 카드(spotlight)는 하위 요소(LetterCard)의 이벤트를 일시 정지
                      style={{ 
                        pointerEvents: "auto",
                        zIndex: isSpotlight ? 1001 : 1 
                      }}
                    >
                        <LetterCard
                          data={letter}
                          isFocused={focusedId === letter.letterId}
                          onToggleBookmark={() => handleToggleBookmark(letter.letterId)}
                          bgImage={THEME_IMAGES[letter.themeCode] || THEME_IMAGES.theme1}
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

            {/* 상세보기 모달 */}
            {selectedLetter && (
              <LetterDetail
                isOpen={!!selectedLetter}
                onClose={() => setSelectedLetter(null)}
                letterId={selectedLetter.letterId}
                themeCode={selectedLetter.themeCode}
                bgImage={THEME_IMAGES[selectedLetter.themeCode] || THEME_IMAGES.theme1}
                onMarkAsRead={handleMarkAsRead}
              />
            )}

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
