import React, { useState } from 'react';
import bg from '../assets/background_nostar.png';
import '../styles/gallery.css';

const TimeCapsule = () => {
  const tabs = ['RECORD', 'ALBUM']; /*나중에 폰트 바꿔주기*/
  const [activeIndex, setActiveIndex] = useState(0);
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  return (
    <div
      className="timecapsule-container"
      style={{ backgroundImage: `url(${bg})` }}
    >
        {/* 상단 세부 네비 */}
        <div style={{ display: 'flex', gap: '50px', marginBottom: '20px', marginLeft: '60px', marginTop: '10px' }}>
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
        </div>
  );
};