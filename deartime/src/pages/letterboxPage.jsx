import React, { useState, useMemo } from 'react';
import '../styles/LetterboxPage.css';
import LetterCard from '../components/LetterCard';
import MailTabs from '../components/MailTabs'; 
import SendButton from '../components/SendButton'; 
import letterData from '../mocks/letterboxData.json';

const Letterbox = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [page, setPage] = useState(1);

    const letters = letterData.data; // 편지 데이터
    const pageSize = 8; // 한 페이지에 보여줄 카드 개수

    const [isLoading] = useState(false); 

    // 페이지 계산 로직
    const totalElements = letters.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
    const safePage = Math.min(page, totalPages);

    const pageNumbers = useMemo(
        () => Array.from({ length: totalPages }, (_, i) => i + 1),
        [totalPages]
    );

    // 현재 페이지에 보여줄 데이터 필터링 (Slice)
    const currentItems = useMemo(() => {
        const firstIdx = (safePage - 1) * pageSize;
        const lastIdx = firstIdx + pageSize;
        return letters.slice(firstIdx, lastIdx);
    }, [safePage, letters]);

    return (
        <div className="letterbox-container">
            <div className="letterbox-content">
                <header className="letterbox-header">
                    <MailTabs 
                        activeIndex={activeIndex} 
                        setActiveIndex={setActiveIndex} 
                        setPage={setPage} 
                    />
                    <SendButton />
                </header>

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