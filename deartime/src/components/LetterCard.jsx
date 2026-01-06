import React, {useState, useRef} from 'react';
import '../styles/LetterCard.css';
import DeleteCheck from '../components/DeleteCheck';
import LetterDetail from '../components/LetterDetail';

// 배경 이미지 임포트
import bgDarkBlue from '../assets/bg-dark-blue.png';
import bgLightPink from '../assets/bg-light-pink.png';
import bgLightGrey from '../assets/bg-light-grey.png';

const THEME_IMAGES = {
    DEFAULT: bgDarkBlue, 
    PINK: bgLightPink,
    GREY: bgLightGrey
};

const LetterCard = ({ data, isFocused, setFocusedId, onDelete }) => {
    const {
        senderNickname,
        title,
        summary,
        themeCode,
        sentAt,
        isRead,
        isBookmarked
    } = data;

    const currentBgImage = THEME_IMAGES[themeCode] || THEME_IMAGES.DEFAULT;

    // 즐겨찾기 상태를 로컬 state로 관리 (초기값은 서버/Mock 데이터)
    const [starred, setStarred] = useState(isBookmarked);

    //삭제 기능 : 꾹 누르기 + 우클릭
    const timerRef = useRef(null); // 꾹 누르기 시간을 측정할 타이머
    const [isCheckOpen, setIsCheckOpen] = useState(false); // 팝업 전용 상태
    const isLongPress = useRef(false); // 롱프레스 여부를 기록할 변수 추가

    //상세보기 상태
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // 토글 핸들러 함수
    const handleBookmarkToggle = (e) => {
        e.stopPropagation(); // 카드 클릭 이벤트(상세페이지 이동 등)와 겹치지 않게 방지
        setStarred(!starred);
    };

    // 날짜 변환 로직 추가 (sentAt이 문자열이므로 변환 필요)
    const formattedDate = sentAt.split('T')[0].replace(/-/g, '.');


    // --------- 삭제 관련 로직 ---------
    // 공통으로 실행될 '삭제 메뉴 열기' 함수
    const openDeleteMenu = (e) => {
        if (e) {
            e.preventDefault(); // 브라우저 기본 메뉴 방지
            e.stopPropagation();
        }
        setFocusedId(data.letterId); // 내가 선택됐음을 부모에게 알림
        isLongPress.current = true;
    };

    // 통합 클릭 핸들러
    const handleCardClick = (e) => {
        e.stopPropagation();

        // 롱프레스 직후에 손을 뗄 때 발생하는 클릭은 무시
        if (isLongPress.current) {
            isLongPress.current = false; // 다음 일반 클릭을 위해 초기화
            return; 
        }

        // 일반 클릭 로직
        if (isFocused) {
            setFocusedId(null); // 메뉴가 떠 있을 때 클릭하면 닫기
        } else {
            // 일반 클릭 시 상세보기 팝업 열기
            setIsDetailOpen(true);
            console.log("상세 페이지 이동"); 
        }
    };

    // 누르기 시작 (타이머 시작)
    const startPress = (e) => {
        isLongPress.current = false; // 시작할 때 초기화
        timerRef.current = setTimeout(() => {
            openDeleteMenu(e);
        }, 500); // 0.5초 기준
    };

    // 손 떼기 (타이머 취소)
    const cancelPress = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    };

    //팝업 띄우기
    const handleDeleteClick = (e) => {
        e.stopPropagation();

        setIsCheckOpen(true);
        //setFocusedId(null); // 메뉴 닫기
    };

    //확인 팝업에서 '삭제'를 눌렀을 때 (실제로 데이터 지우기)
    const handleConfirmDelete = () => {
        console.log(`ID ${data.letterId} 삭제 진행`);

        onDelete(data.letterId);

        // API 연동 로직...
        setIsCheckOpen(false);
        setFocusedId(null); // 전체 배경 어두움 해제
    };

    // 확인 팝업에서 '취소'를 눌렀을 때
    const handleCancelDelete = () => {
        setIsCheckOpen(false);
        setFocusedId(null);
    };

    return (
            <>
            <div 
                className={`letter-card theme-${themeCode} ${isFocused ? 'focused' : ''}`}
                // 배경 이미지 스타일 추가
                style={{ backgroundImage: `url(${THEME_IMAGES[themeCode] || THEME_IMAGES.DEFAULT})` }}
                onContextMenu={openDeleteMenu}
                onMouseDown={startPress}
                onMouseUp={cancelPress}
                onTouchStart={startPress}
                onTouchEnd={cancelPress}
                onClick={handleCardClick}
            >

                {isFocused && (
                    <div className="delete-overlay">
                        <button className="delete-btn" onClick={handleDeleteClick}>
                            <span className="trash-icon">🗑️</span>
                            삭제
                        </button>
                    </div>
                )}

                <div className="card-top">
                    <span className="sender-info">from. {senderNickname}</span>
                    
                    {/* 클릭 가능한 별 아이콘 */}
                    <span 
                        className={`bookmark-icon ${starred ? 'active' : ''}`} 
                        onClick={handleBookmarkToggle}
                        style={{ 
                            cursor: 'pointer', 
                            color: starred ? '#FFD700' : 'rgba(255, 255, 255, 0.4)',
                            fontSize: '22px'
                        }}
                    >
                        {starred ? '★' : '☆'} 
                    </span>
                </div>

                <div className="card-body">
                    <h4 className="title-text">{title}</h4>
                    <p className="summary-text">{summary}</p> 
                </div>

                <div className="card-bottom">
                    <span className="sent-date">{formattedDate}</span>
                    <div className="letter-status">
                        {!isRead && (
                            <span className="unread" style={{ color: '#FF4D4D', fontWeight: 'bold' }}>
                                안읽음
                            </span>
                        )}
                        {isRead && <span className="read">읽음</span>}
                    </div>
                </div>
            </div>
            {/* 상세보기 모달 */}
            <LetterDetail 
                isOpen={isDetailOpen} 
                onClose={() => setIsDetailOpen(false)} 
                letterId={data.letterId}
                bgImage={currentBgImage}
                themeCode={themeCode}
            />

            {/* 삭제팝업  컴포넌트를 카드 바깥에 배치 */}
            <DeleteCheck 
                isOpen={isCheckOpen} 
                onClose={handleCancelDelete} 
                onConfirm={handleConfirmDelete} 
            />
        </>
    );
};

export default LetterCard;