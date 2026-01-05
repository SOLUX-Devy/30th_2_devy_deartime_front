import React, { useState, useEffect, useMemo } from 'react';
import '../styles/LetterboxPage.css';
import LetterCard from '../components/LetterCard';
import MailTabs from '../components/MailTabs'; 
import SendButton from '../components/SendButton'; 

const Letterbox = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [page, setPage] = useState(1);

    const [letters, setLetters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const pageSize = 8; // 한 페이지에 보여줄 카드 개수

    // 탭 인덱스별 API 경로 매핑
    // 실제 서버 연결 시 해당 경로로 변경 필요, 현재는 publick 폴더에 넣어놓은 mock 데이터 사용
    const getApiUrl = (index) => {
        switch (index) {
            case 0: return '/letterboxMocks/received.json'; // 받은 편지
            case 1: return '/letterboxMocks/sent.json';     // 보낸 편지
            case 2: return '/letterboxMocks/bookmarks.json'; // 즐겨찾기
            case 3: return '/letterboxMocks/shared.json';    // 우리의 우체통
            default: return '/letterboxMocks/received.json';
        }
    };

    // activeIndex가 바뀔 때마다 서버(혹은 mock)에 새로 요청
    useEffect(() => {
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

    return (
        <div className="letterbox-container">
            <header className="letterbox-header">
                    <MailTabs 
                        activeIndex={activeIndex} 
                        setActiveIndex={(index) => {
                            setIsLoading(true); //클릭하는 순간 로딩 시작
                            setActiveIndex(index);
                        }} 
                        setPage={setPage} 
                    />
                    <SendButton />
            </header>
            <div className="letterbox-content">
                <span className="tc-pagination-info">
                    {totalElements}개 중 {startItem}-{endItem}
                </span>

                <main className="letter-grid">
                    {isLoading ? (
                        <p>로딩 중...</p>
                    ) : (
                        currentItems.map((letter) => (
                            <LetterCard key={letter.letterId} data={letter} />
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
            </div>
        </div>
    );
};
export default Letterbox;