import React, { useState, useEffect } from 'react';
import '../styles/LetterDetail.css';

const LetterDetail = ({ isOpen, onClose, letterId, bgImage, themeCode }) => {
    const [detailData, setDetailData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !letterId) return;

        // setIsLoading(true)를 동기적으로 바로 호출하지 말고,데이터를 가져오는 비동기 로직의 '시작점'으로 처리
        const fetchDetail = async () => {
            setIsLoading(true); // 비동기 함수 내에서 호출하면 '계단식' 경고를 피할 수 있음
            
            // 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 500));
            setDetailData({ 
                content: "테스트 문구입니다. ".repeat(100) // 100번 반복
                });
            setIsLoading(false);
        };

        fetchDetail();
    }, [isOpen, letterId]);

    if (!isOpen) return null;

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
                            <h2 className="detail-title">상세 보기</h2>
                            <hr className="divider" />
                            {/* 서버에서 받아온 상세 본문 */}
                            <p className="detail-text">{detailData?.content}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LetterDetail;