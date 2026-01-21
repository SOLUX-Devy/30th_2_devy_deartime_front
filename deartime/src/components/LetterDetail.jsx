import React, { useState, useEffect } from 'react';
import '../styles/LetterDetail.css';

const LetterDetail = ({ isOpen, onClose, letterId, bgImage, themeCode }) => {
    const [detailData, setDetailData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !letterId) return;

        let isMounted = true; // 컴포넌트가 마운트된 상태인지 추적

        // setIsLoading(true)를 동기적으로 바로 호출하지 말고,데이터를 가져오는 비동기 로직의 '시작점'으로 처리
        const fetchDetail = async () => {
            setIsLoading(true);
            setDetailData(null);
            try {
                const response = await fetch(`/api/letters/${letterId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                });

                const json = await response.json();

                if (isMounted && json.success) { // 마운트된 상태일 때만 set
                setDetailData(json.data);
                }
            } catch (err) {
                if (isMounted) console.error("에러 발생:", err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchDetail();

    return () => { isMounted = false; }; // 언마운트 시 false로 변경
}, [isOpen, letterId]);

    if (!isOpen) return null;

    // 날짜 포맷 로직 (2025-12-15T00:53:36 -> 2025.12.15)
    const formattedDate = detailData?.sentAt 
        ? detailData.sentAt.split("T")[0].replace(/-/g, ".") 
        : "";

    return (
        <div className="detail-overlay" onClick={onClose}>
            <div 
                className={`letter-paper theme-${themeCode}`} 
                style={{ backgroundImage: `url(${bgImage})` }} 
                onClick={(e) => e.stopPropagation()}
            >
                <button className="close-btn" onClick={onClose}>&times;</button>
                
                <div className="letter-content-wrapper">
                    {isLoading ? (
                        <p className="loading-text">편지를 읽어오는 중...</p>
                    ) : (
                        <>

                        <div className="paper-header">
                                {/* 보낸 사람과 받는 사람 정보 추가 */}
                                <div className="detail-from">From. <span>{detailData?.senderNickname}</span></div>
                                <div className="detail-to">To. <span>{detailData?.receiverNickname}</span></div>
                            </div>

                            <hr className="divider" />
                            
                            <div className="paper-body">
                                <h2 className="detail-title">{detailData?.title}</h2>
                                <p className="detail-text">
                                    {detailData?.content || "내용이 없습니다."}
                                </p>
                            </div>

                            <div className="paper-footer">
                                {/* 날짜 추가 */}
                                <span className="detail-date">{formattedDate}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LetterDetail;