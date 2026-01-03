import React, { useState } from 'react';
import bg from '../assets/background_nostar.png';
import '../styles/timecapsule.css';

const TimeCapsule = () => {
  const tabs = ['전체 캡슐', '받은 캡슐', '나의 캡슐'];
  const [activeIndex, setActiveIndex] = useState(0);
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  return (
    <div
      className="timecapsule-container"
      style={{ backgroundImage: `url(${bg})` }}
    >
        {/* 상단 세부 네비 */}
        <div style={{ display: 'flex', gap: '50px', marginBottom: '0px', marginLeft: '60px', marginTop: '10px' }}>
          {tabs.map((tab, index) => {
            const isActive = index === activeIndex;

            return (
              <span
                key={tab}
                onClick={() => setActiveIndex(index)}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.opacity = 1;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.opacity = 0.7;
                }}
                style={{
                  position: 'relative',
                  fontSize: '20px',
                  fontWeight: isActive ? 600 : 350,
                  paddingBottom: '6px',
                  cursor: 'pointer',
                  color: 'white',
                  opacity: isActive ? 1 : 0.7,
                  transition: 'opacity 0.2s ease',
                }}
              >
                {tab}

                {/* 클릭 시에만 촤악 나오는 밑줄 */}
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: '100%',
                    height: '2px',
                    backgroundColor: '#0E77BC',
                    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'center',
                    transition: 'transform 0.3s ease',
                  }}
                />
              </span>
            );
          })}
        </div>

        {/* 열린 캡슐만 보기 (CSS/JSX 분리) */}
        <div className="open-only-toggle">
          <span className="toggle-label">열린 캡슐만 보기</span>

            <button
              type="button"
              className={`toggle-button ${showOpenOnly ? 'on' : ''}`}
              onClick={() => setShowOpenOnly((prev) => !prev)}
              aria-pressed={showOpenOnly}
            >
              <span className="toggle-knob" />
            </button>
        </div>

      {/* 탭별 내용 (여기에 기존 타임캡슐 내용 넣으면 됨) */}
      {activeIndex === 0 && (
        <div style={{ color: 'white' }}>
          {/* 전체 캡슐 내용 */}
        </div>
      )}

      {activeIndex === 1 && (
        <div style={{ color: 'white' }}>
          {/* 받은 캡슐 내용 */}
        </div>
      )}

      {activeIndex === 2 && (
        <div style={{ color: 'white' }}>
          {/* 나의 캡슐 내용 */}
        </div>
      )}
    </div>
  );
};

export default TimeCapsule;
