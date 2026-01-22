import React from 'react';
import '../styles/MailTabs.css';

const MailTabs = ({ activeIndex, setActiveIndex}) => {
    const tabs = ["받은 편지", "보낸 편지", "즐겨찾기", "우리의 우체통"];

    return (
        <div
            style={{
                display: 'flex',
                gap: '50px',
                marginLeft: '60px',
                marginTop: '3px'
            }}
        >
            {tabs.map((tab, index) => {
                const isActive = index === activeIndex;
                return (
                    <span
                        key={tab}
                        className={`tab-item ${isActive ? 'active' : ''}`}
                        onClick={() => {
                            setActiveIndex(index);
                        }}
                    >
                        {tab}
                        <span 
                            className="underline"
                            style={{ transform: isActive ? 'scaleX(1)' : 'scaleX(0)' }}
                        />
                    </span>
                );
            })}
        </div>
    );
};

export default MailTabs;