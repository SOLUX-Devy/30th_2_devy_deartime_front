import React from 'react';
import bg from '../assets/background_nostar.png';
import '../styles/timecapsule.css';

const TimeCapsule = () => {
  return (
    <div
      className="timecapsule-container"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* 기존 타임캡슐 내용 */}
    </div>
  );
};

export default TimeCapsule;
