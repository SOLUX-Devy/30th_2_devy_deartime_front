import React, { useState, useEffect, useMemo } from 'react';
import '../styles/LetterboxPage.css';
import LetterCard from '../components/LetterCard';
import MailTabs from '../components/MailTabs'; 
import SendButton from '../components/SendButton'; 
import SharedMailbox from '../components/SharedMailbox';
import FriendSelect from "../components/FriendSelect";

const Letterbox = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [page, setPage] = useState(1);

    const [letters, setLetters] = useState([]); // 편지 데이터 상태
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태 관리
    const [focusedId, setFocusedId] = useState(null); // 현재 포커스된 카드 ID 관리

    const [selectedFriend, setSelectedFriend] = useState(null); // 친구 선택 상태

    const [isSelectorOpen, setIsSelectorOpen] = useState(false); // 친구 선택기 열림 상태

    const handlePageClick = () => {
        if (focusedId) {
            setFocusedId(null);
        }
    };

    const pageSize = 8; // 한 페이지에 보여줄 카드 개수

    // 탭 인덱스별 API 경로 매핑
    // 실제 서버 연결 시 해당 경로로 변경 필요, 현재는 publick 폴더에 넣어놓은 mock 데이터 사용
    const getApiUrl = (index) => {
        switch (index) {
            case 0: return '/letterboxMocks/received.json'; // 받은 편지
            case 1: return '/letterboxMocks/sent.json';     // 보낸 편지
            case 2: return '/letterboxMocks/bookmarks.json'; // 즐겨찾기
            // 우리의 우체통 부분은 제거
            default: return '/letterboxMocks/received.json';
        }
    };

    // activeIndex가 바뀔 때마다 서버(혹은 mock)에 새로 요청
    useEffect(() => {
        if (activeIndex === 3) return;

        // 0, 1, 2일 때만 비동기 fetch 실행
        const url = getApiUrl(activeIndex);
        if (!url) return;

        // 실제 Spring Boot 연결 시: fetch(`http://localhost:8080/api/letters/${getApiUrl(activeIndex)}?page=${page}`)
        fetch(getApiUrl(activeIndex)) 
            .then((res) => res.json())
            .then((json) => {
                setLetters(json.data); // 서버가 준 해당 탭의 데이터로 교체
                setIsLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setIsLoading(false);
            });
    }, [activeIndex]); // 탭이 바뀔 때 실행

    // 페이지 계산 로직
    const totalElements = letters.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
    const safePage = Math.min(page, totalPages);

    const startItem = totalElements === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const endItem = Math.min(safePage * pageSize, totalElements);

    const pageNumbers = useMemo(
        () => Array.from({ length: totalPages }, (_, i) => i + 1),
        [totalPages]
    );

    // 현재 페이지에 보여줄 데이터 필터링
    const currentItems = useMemo(() => {
        const firstIdx = (safePage - 1) * pageSize;
        const lastIdx = firstIdx + pageSize;
        return letters.slice(firstIdx, lastIdx);
    }, [safePage, letters]);

    //삭제 로직 : 특정 ID 제외 나머지만 남김
    const deleteLetter = (id) => {
        // filter 함수를 사용하는 것이 가장 Efficient(효율적)합니다.
        setLetters((prevLetters) => prevLetters.filter(letter => letter.letterId !== id));
    };

    //즐겨찾기 토글 로직
    const handleToggleBookmark = (id) => {
        setLetters(prevLetters => 
            prevLetters.map(letter => 
                letter.letterId === id 
                    ? { ...letter, isBookmarked: !letter.isBookmarked } 
                    : letter
            )
        );
    };

    //읽음 처리 로직
    const handleMarkAsRead = (id) => {
        setLetters(prevLetters => 
            prevLetters.map(letter => 
                letter.letterId === id 
                    ? { ...letter, isRead: true } 
                    : letter
            )
        );
    };

    return (
        <div 
            className={`letterbox-container ${focusedId ? 'is-focusing' : ''}`}
            onClick={handlePageClick} // 여기서 모든 클릭을 감지
        >
            <header className="letterbox-header" onClick={(e) => e.stopPropagation()}>
                    <MailTabs 
                        activeIndex={activeIndex} 
                        setActiveIndex={(index) => {
                            setPage(1);
                            setIsLoading(index !== 3);
                            setActiveIndex(index);
                            // 🌟 탭 전환 시 팝업 상태와 선택된 친구 초기화 (필요시)
                            if (index !== 3) {
                                setIsSelectorOpen(false);
                                setSelectedFriend(null);
                            }
                        }} 
                    />
                    <SendButton />
            </header>
            <div className="letterbox-content">
                {activeIndex === 3 ? (
                    /* 1. 우리의 우체통 (Index 3) */
                    <>
                    {!selectedFriend ? (
                        /* 친구 선택 전: 초기 화면 */
                        <div className="shared-mailbox-container">
                            
                            {!selectedFriend && (
                                <header className="shared-header">
                                <button 
                                    className="friend-select-trigger user-tag" // 두 클래스 모두 적용
                                    onClick={() => setIsSelectorOpen(true)}
                                >
                                    친구 선택
                                    <span className="arrow">→</span>
                                </button>
                                </header>
                            )}

                            {!selectedFriend ? (
                                <div className="shared-mailbox-empty">
                                <div className="empty-content">
                                    <div className="mail-icon">
                                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                        <polyline points="22,6 12,13 2,6"></polyline>
                                    </svg>
                                    </div>
                                    <p>친구를 선택하면 우리의 추억이 펼쳐집니다.</p>
                                </div>
                                </div>
                            ) : (
                                <SharedMailbox 
                                selectedFriend={selectedFriend} 
                                onBack={() => setSelectedFriend(null)} 
                                />
                            )}

                            {/* 친구 선택기 팝업 (기존과 동일) */}
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
                        /* 친구 선택 후: 공유 우체통 화면 */
                        <SharedMailbox 
                        selectedFriend={selectedFriend} 
                        onBack={() => setSelectedFriend(null)} 
                        />
                    )}

                    {/* 친구 선택기 팝업 (조건에 상관없이 렌더링되도록 위치 조정) */}
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
                    /* 2. 일반 편지함 (Index 0, 1, 2) */
                    <>
                    <span className="tc-pagination-info">
                        {totalElements}개 중 {startItem}-{endItem}
                    </span>

                    <main className="letter-grid">
                        {isLoading ? (
                        <p>로딩 중...</p>
                        ) : (
                        currentItems.map((letter) => (
                            <LetterCard 
                            key={letter.letterId} 
                            data={letter} 
                            isFocused={focusedId === letter.letterId} 
                            setFocusedId={setFocusedId}
                            onDelete={deleteLetter}
                            onToggleBookmark={handleToggleBookmark} 
                            onMarkAsRead={handleMarkAsRead}
                            />  
                        ))
                        )}
                    </main>

                    {/* 페이지네이션 */}
                    {totalPages > 1 && (
                        <div className="tc-pagination">
                        {pageNumbers.map((p) => (
                            <button
                            key={p}
                            type="button"
                            onClick={() => setPage(p)}
                            className={`tc-page ${p === safePage ? 'active' : ''}`}
                            >
                            {p}
                            </button>
                        ))}
                        </div>
                    )}
                    </>
                )}
                </div>
        </div>
    );
};
export default Letterbox;