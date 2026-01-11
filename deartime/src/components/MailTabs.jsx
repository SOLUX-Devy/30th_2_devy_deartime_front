import React from 'react';

const MailTabs = ({ activeIndex, setActiveIndex, setPage }) => {
    const tabs = ["받은 편지", "보낸 편지", "즐겨찾기", "우리의 우체통"];

    return (
        <div
            style={{
                display: 'flex',
                gap: '50px',
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
                            setActiveIndex(index); // 클릭 시 활성 탭 변경
                            setPage(1);            // 탭 변경 시 페이지를 1로 리셋
                        }}
                        style={{
                            position: 'relative',
                            fontSize: '20px',
                            fontWeight: isActive ? 600 : 350,
                            paddingBottom: '6px',
                            cursor: 'pointer',
                            color: 'white',
                            opacity: isActive ? 1 : 0.7, // 활성 탭은 opacity 1, 비활성은 0.7
                            transition: 'opacity 0.3s ease',
                        }}
                    >
                        {tab}

                        {/* 활성 탭 밑줄 애니메이션 */}
                        <span
                            style={{
                                position: 'absolute',
                                left: 0,
                                bottom: 0,
                                width: '100%',
                                height: '2px',
                                backgroundColor: '#0E77BC', // 요구사항의 파란색 강조선
                                transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                                transformOrigin: 'left',
                                transition: 'transform 0.3s ease',
                            }}
                        />
                    </span>
                );
            })}
        </div>
    );
};

export default MailTabs;